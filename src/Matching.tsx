import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRecoilValue } from "recoil";
import { userState } from "./recoil/atoms/userAtom";

type GameType = "blitz" | "rapid" | "bullet";

export default function Matching() {
  const user = useRecoilValue(userState);
  const [selectedGameType, setSelectedGameType] = useState<GameType>("rapid");
  const [isMatching, setIsMatching] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [matchResult, setMatchResult] = useState<string>("");
  const navigate = useNavigate();

  const mainClick = () => {
    navigate("/");
  };

  const handleGameTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGameType(e.target.value as GameType);
  };

  const webSocketConnection = () => {
    const socket = new SockJS("http://localhost:8080/ws");

    const client = new Client({
      webSocketFactory: () => socket, // SockJS를 사용하여 WebSocket 연결 설정
      debug: (str) => console.log(str), // 디버그 로그 출력
      onConnect: () => {
        console.log("Connected to WebSocket");

        // 매칭 성공 메시지를 수신
        client.subscribe("/topic/match-success", (message) => {
          setMatchResult(message.body);
        });

        setStompClient(client); // 상태에 클라이언트 저장
      },
      onStompError: (frame) => {
        console.error("Broker reported error: ", frame.headers["message"]);
        console.error("Additional details: ", frame.body);
      },
    });

    client.activate(); // WebSocket 연결 활성화
  };

  const initiateMatch = () => {
    if (!stompClient || !stompClient.connected) {
      alert("WebSocket 연결이 설정되지 않았습니다.");
      return;
    }

    // 매칭 요청 전송
    stompClient.publish({
      destination: "/app/match",
      body: JSON.stringify({ userId: user.userId, selectedGameType }), // 플레이어 ID 예시
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-4">
      <h1 className="text-4xl font-bold mb-8">랜덤 매칭</h1>
      <div className="w-full max-w-md bg-neutral-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="gameType" className="block text-sm font-medium mb-2">
            게임 유형 선택
          </label>
          <select
            id="gameType"
            value={selectedGameType}
            onChange={handleGameTypeChange}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rapid">래피드</option>
            <option value="blitz">블리츠</option>
            <option value="bullet">불릿</option>
          </select>
        </div>
        {!isMatching ? (
          <button
            onClick={webSocketConnection}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            매칭 시작
          </button>
        ) : (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-lg font-semibold">매칭 중...</span>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300">
              매칭 취소
            </button>
          </div>
        )}

        <button
          onClick={initiateMatch}
          disabled={!stompClient || !stompClient.connected}
        >
          Start Match
        </button>
      </div>
      <div className="text-center">
        <button
          className="font-medium text-blue-600 hover:text-blue-500"
          onClick={mainClick}
        >
          메인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
