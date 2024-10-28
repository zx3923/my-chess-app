import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import MainScreen from "./MainScreen";
import ChessBoard from "./ChessBoard";
import SignUp from "./SignUp";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "",
        element: <MainScreen />,
      },
      {
        path: "chessboard",
        element: <ChessBoard />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
    ],
  },
]);
export default router;
