import React, { useState, useEffect, useCallback } from "react";

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type PieceColor = "white" | "black";

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Square = Piece | null;

const initialBoard: Square[][] = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  Array(8).fill({ type: "pawn", color: "black" }),
  ...Array(4).fill(Array(8).fill(null)),
  Array(8).fill({ type: "pawn", color: "white" }),
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
];

const ChessPiece: React.FC<{ piece: Piece }> = ({ piece }) => {
  const pieceSymbols: { [key in PieceType]: string } = {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  };

  return (
    <span
      className={`text-4xl ${
        piece.color === "white" ? "text-gray-200" : "text-black"
      }`}
    >
      {pieceSymbols[piece.type]}
    </span>
  );
};

export default function Component() {
  const [board, setBoard] = useState<Square[][]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null
  );
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");
  const [whiteTime, setWhiteTime] = useState(60);
  const [blackTime, setBlackTime] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>([
    "게임이 시작되었습니다. 백의 차례입니다.",
  ]);
  const [showPromotion, setShowPromotion] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const addToGameLog = useCallback((message: string) => {
    setGameLog((prevLog) => [...prevLog, message]);
  }, []);

  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      if (currentPlayer === "white") {
        setWhiteTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setIsGameOver(true);
            addToGameLog("시간 초과! 흑의 승리입니다.");
            return 0;
          }
          return prevTime - 1;
        });
      } else {
        setBlackTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setIsGameOver(true);
            addToGameLog("시간 초과! 백의 승리입니다.");
            return 0;
          }
          return prevTime - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, isGameOver, addToGameLog]);

  const isValidMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case "pawn":
        if (piece.color === "white") {
          if (
            fromRow === 6 &&
            toRow === 4 &&
            fromCol === toCol &&
            !board[5][toCol] &&
            !board[4][toCol]
          )
            return true;
          if (
            toRow === fromRow - 1 &&
            fromCol === toCol &&
            !board[toRow][toCol]
          )
            return true;
          if (
            toRow === fromRow - 1 &&
            Math.abs(toCol - fromCol) === 1 &&
            board[toRow][toCol]?.color === "black"
          )
            return true;
        } else {
          if (
            fromRow === 1 &&
            toRow === 3 &&
            fromCol === toCol &&
            !board[2][toCol] &&
            !board[3][toCol]
          )
            return true;
          if (
            toRow === fromRow + 1 &&
            fromCol === toCol &&
            !board[toRow][toCol]
          )
            return true;
          if (
            toRow === fromRow + 1 &&
            Math.abs(toCol - fromCol) === 1 &&
            board[toRow][toCol]?.color === "white"
          )
            return true;
        }
        return false;
      case "rook":
        return (
          (fromRow === toRow || fromCol === toCol) &&
          !isPathBlocked(fromRow, fromCol, toRow, toCol)
        );
      case "knight":
        return (
          (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
        );
      case "bishop":
        return (
          rowDiff === colDiff && !isPathBlocked(fromRow, fromCol, toRow, toCol)
        );
      case "queen":
        return (
          (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) &&
          !isPathBlocked(fromRow, fromCol, toRow, toCol)
        );
      case "king":
        return rowDiff <= 1 && colDiff <= 1;
      default:
        return false;
    }
  };

  const isPathBlocked = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): boolean => {
    const rowStep = fromRow < toRow ? 1 : fromRow > toRow ? -1 : 0;
    const colStep = fromCol < toCol ? 1 : fromCol > toCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) {
        return true;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return false;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (isGameOver) return;

    const clickedPiece = board[row][col];

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = board[selectedRow][selectedCol];

      if (selectedPiece && selectedPiece.color === currentPlayer) {
        if (isValidMove(selectedRow, selectedCol, row, col)) {
          const newBoard = board.map((row) => [...row]);
          newBoard[row][col] = selectedPiece;
          newBoard[selectedRow][selectedCol] = null;

          if (selectedPiece.type === "pawn" && (row === 0 || row === 7)) {
            setShowPromotion({ row, col });
            setBoard(newBoard);
            return;
          }

          setBoard(newBoard);
          addToGameLog(
            `${
              currentPlayer === "white" ? "백" : "흑"
            }이 (${selectedRow}, ${selectedCol})에서 (${row}, ${col})로 이동했습니다.`
          );
          setSelectedSquare(null);
          setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
          addToGameLog(
            `${currentPlayer === "white" ? "흑" : "백"}의 차례입니다.`
          );
        } else {
          setSelectedSquare(
            clickedPiece && clickedPiece.color === currentPlayer
              ? [row, col]
              : null
          );
        }
      } else {
        setSelectedSquare(
          clickedPiece && clickedPiece.color === currentPlayer
            ? [row, col]
            : null
        );
      }
    } else if (clickedPiece && clickedPiece.color === currentPlayer) {
      setSelectedSquare([row, col]);
    }
  };

  const handlePromotion = (pieceType: PieceType) => {
    if (!showPromotion) return;

    const { row, col } = showPromotion;
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = { type: pieceType, color: currentPlayer };
    setBoard(newBoard);
    setShowPromotion(null);
    setSelectedSquare(null);
    setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
    addToGameLog(
      `${currentPlayer === "white" ? "백" : "흑"}의 폰이 ${
        row === 0 ? "8" : "1"
      }줄에서 ${pieceType}으로 승급했습니다.`
    );
    addToGameLog(`${currentPlayer === "white" ? "흑" : "백"}의 차례입니다.`);
  };

  const restartGame = () => {
    setBoard(initialBoard);
    setSelectedSquare(null);
    setCurrentPlayer("white");
    setWhiteTime(60);
    setBlackTime(60);
    setIsGameOver(false);
    setGameLog(["게임이 다시 시작되었습니다. 백의 차례입니다."]);
    setShowPromotion(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4 text-gray-200">
      <div className="mb-4 text-2xl font-bold">
        {currentPlayer === "white" ? "White's turn" : "Black's turn"}
      </div>
      <div className="flex justify-between w-full max-w-2xl mb-4">
        <div className="text-xl">White: {whiteTime}s</div>
        <div className="text-xl">Black: {blackTime}s</div>
      </div>
      <div className="grid grid-cols-8 gap-0 border-4 border-neutral-600 mb-4 p-0.5">
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-11 h-11 sm:w-15 sm:h-15 flex items-center justify-center cursor-pointer
                ${
                  (rowIndex + colIndex) % 2 === 0
                    ? "bg-neutral-700"
                    : "bg-neutral-800"
                }
                ${
                  selectedSquare &&
                  selectedSquare[0] === rowIndex &&
                  selectedSquare[1] === colIndex
                    ? "bg-zinc-500"
                    : ""
                }
                hover:bg-neutral-600 transition-colors duration-200
              `}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {square && <ChessPiece piece={square} />}
            </div>
          ))
        )}
      </div>
      {showPromotion && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl mb-2">폰 승급</h2>
          <div className="flex space-x-2">
            {["queen", "rook", "bishop", "knight"].map((pieceType) => (
              <button
                key={pieceType}
                className="w-12 h-12 bg-neutral-700 hover:bg-neutral-600 rounded"
                onClick={() => handlePromotion(pieceType as PieceType)}
              >
                <ChessPiece
                  piece={{ type: pieceType as PieceType, color: currentPlayer }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl h-40 overflow-y-auto bg-neutral-700 text-gray-200 p-4 rounded shadow">
        {gameLog.map((log, index) => (
          <p key={index} className="mb-1">
            {log}
          </p>
        ))}
      </div>
      <button
        onClick={restartGame}
        className="mt-4 px-4 py-2 bg-neutral-600 text-gray-200 rounded hover:bg-neutral-500 transition-colors"
      >
        Restart Game
      </button>
    </div>
  );
}
