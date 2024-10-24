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
        piece.color === "white" ? "text-white" : "text-gray-800"
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
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");
  const [whiteTime, setWhiteTime] = useState(60);
  const [blackTime, setBlackTime] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>([
    "게임이 시작되었습니다. 백의 차례입니다.",
  ]);

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

  const getPossibleMoves = (row: number, col: number): [number, number][] => {
    const possibleMoves: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (
          isValidMove(row, col, i, j) &&
          (board[i][j] === null || board[i][j]?.color !== currentPlayer)
        ) {
          possibleMoves.push([i, j]);
        }
      }
    }
    return possibleMoves;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (isGameOver) return;

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const piece = board[selectedRow][selectedCol];

      if (
        piece &&
        piece.color === currentPlayer &&
        isValidMove(selectedRow, selectedCol, row, col)
      ) {
        const newBoard = board.map((row) => [...row]);
        newBoard[row][col] = piece;
        newBoard[selectedRow][selectedCol] = null;
        setBoard(newBoard);

        addToGameLog(
          `${
            currentPlayer === "white" ? "백" : "흑"
          }이 (${selectedRow}, ${selectedCol})에서 (${row}, ${col})로 이동했습니다.`
        );

        setSelectedSquare(null);
        setPossibleMoves([]);
        setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
        addToGameLog(
          `${currentPlayer === "white" ? "흑" : "백"}의 차례입니다.`
        );
      } else {
        setSelectedSquare([row, col]);
        setPossibleMoves(getPossibleMoves(row, col));
      }
    } else if (board[row][col] && board[row][col]?.color === currentPlayer) {
      setSelectedSquare([row, col]);
      setPossibleMoves(getPossibleMoves(row, col));
    }
  };

  const restartGame = () => {
    setBoard(initialBoard);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentPlayer("white");
    setWhiteTime(60);
    setBlackTime(60);
    setIsGameOver(false);
    setGameLog(["게임이 다시 시작되었습니다. 백의 차례입니다."]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4 text-white">
      <div className="mb-4 text-2xl font-bold">
        {currentPlayer === "white" ? "White's turn" : "Black's turn"}
      </div>
      <div className="flex justify-between w-full max-w-2xl mb-4">
        <div className="text-xl">White: {whiteTime}s</div>
        <div className="text-xl">Black: {blackTime}s</div>
      </div>
      <div className="grid grid-cols-8 gap-0 border-4 border-gray-700 mb-4">
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
                ${
                  (rowIndex + colIndex) % 2 === 0
                    ? "bg-gray-500"
                    : "bg-gray-700"
                }
                ${
                  selectedSquare &&
                  selectedSquare[0] === rowIndex &&
                  selectedSquare[1] === colIndex
                    ? "bg-yellow-500"
                    : ""
                }
                ${
                  possibleMoves.some(
                    ([r, c]) => r === rowIndex && c === colIndex
                  )
                    ? "bg-green-500"
                    : ""
                }
                hover:bg-blue-500 transition-colors duration-200 cursor-pointer
              `}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {square && <ChessPiece piece={square} />}
            </div>
          ))
        )}
      </div>
      <div className="w-full max-w-2xl h-40 overflow-y-auto bg-gray-600 text-white p-4 rounded shadow">
        {gameLog.map((log, index) => (
          <p key={index} className="mb-1">
            {log}
          </p>
        ))}
      </div>
      <button
        onClick={restartGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Restart Game
      </button>
    </div>
  );
}
