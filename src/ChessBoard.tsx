import React, { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";

type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
type PieceColor = "w" | "b";

interface Piece {
  type: PieceType;
  color: PieceColor;
}

const ChessPiece: React.FC<{ piece: Piece }> = ({ piece }) => {
  const pieceSymbols: { [key in PieceType]: string } = {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕",
    k: "♔",
  };

  return (
    <span
      className={`text-4xl ${
        piece.color === "w" ? "text-gray-200" : "text-black"
      }`}
    >
      {pieceSymbols[piece.type]}
    </span>
  );
};

export default function AdvancedChessGame() {
  const [chess] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<(Piece | null)[][]>(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("w");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [whiteTime, setWhiteTime] = useState<number>(60);
  const [blackTime, setBlackTime] = useState<number>(60);

  const updateBoard = useCallback(() => {
    setBoard(chess.board());
    setCurrentPlayer(chess.turn());
    if (chess.isGameOver()) {
      setGameOver(true);
      if (chess.isCheckmate())
        setStatus(
          `체크메이트! ${chess.turn() === "w" ? "흑" : "백"}의 승리입니다.`
        );
      else if (chess.isDraw()) setStatus("무승부입니다.");
      else setStatus("게임 종료");
    } else {
      setStatus(`${chess.turn() === "w" ? "백" : "흑"}의 차례입니다.`);
    }
  }, [chess]);

  useEffect(() => {
    updateBoard();
  }, [updateBoard]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      if (currentPlayer === "w") {
        setWhiteTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setGameOver(true);
            setStatus("시간 초과! 흑의 승리입니다.");
            return 0;
          }
          return prevTime - 1;
        });
      } else {
        setBlackTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setGameOver(true);
            setStatus("시간 초과! 백의 승리입니다.");
            return 0;
          }
          return prevTime - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, gameOver]);

  const handleSquareClick = (square: string) => {
    if (gameOver) return;

    if (selectedSquare) {
      try {
        chess.move({
          from: selectedSquare,
          to: square,
          promotion: "q", // 항상 퀸으로 승급
        });
        setSelectedSquare(null);
        updateBoard();
      } catch (e) {
        // 잘못된 이동이면 새로운 말 선택
        setSelectedSquare(square);
      }
    } else {
      const piece = chess.get(square as Square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const restartGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setGameOver(false);
    updateBoard();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4 text-neutral-200">
      <div className="mb-4 text-2xl font-bold">{status}</div>
      <div className="flex justify-between w-full max-w-md mb-4">
        <div
          className={`text-3xl font-bold p-2 rounded ${
            currentPlayer === "w" ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          백: {formatTime(whiteTime)}
        </div>
        <div
          className={`text-3xl font-bold p-2 rounded ${
            currentPlayer === "b" ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          흑: {formatTime(blackTime)}
        </div>
      </div>
      <div className="grid grid-cols-8 gap-0 border-4 border-neutral-600 mb-4 p-0.5">
        {board.flat().map((piece, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const square = `${"abcdefgh"[col]}${8 - row}`;
          return (
            <div
              key={square}
              className={`w-11 h-11 sm:w-15 sm:h-15 flex items-center justify-center cursor-pointer
                ${(row + col) % 2 === 0 ? "bg-neutral-700" : "bg-neutral-800"}
                ${selectedSquare === square ? "bg-neutral-400" : ""}
                hover:bg-neutral-600 transition-colors duration-200
              `}
              onClick={() => handleSquareClick(square)}
            >
              {piece && <ChessPiece piece={piece} />}
            </div>
          );
        })}
      </div>
      <button
        onClick={restartGame}
        className="mt-4 px-4 py-2 bg-blue-600 text-neutral-200 rounded hover:bg-blue-700 transition-colors"
      >
        게임 재시작
      </button>
    </div>
  );
}
