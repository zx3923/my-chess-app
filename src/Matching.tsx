import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type GameType = "blitz" | "rapid" | "bullet";

export default function Matching() {
  const [selectedGameType, setSelectedGameType] = useState<GameType>("rapid");
  const [isMatching, setIsMatching] = useState(false);
  const navigate = useNavigate();

  const mainClick = () => {
    navigate("/");
  };

  const handleGameTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGameType(e.target.value as GameType);
  };

  const startMatching = () => {
    setIsMatching(true);
    console.log(`Started matching for ${selectedGameType} game`);
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
            onClick={startMatching}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            매칭 시작
          </button>
        ) : (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-lg font-semibold">매칭 중...</span>
          </div>
        )}
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
