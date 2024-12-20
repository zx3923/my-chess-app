import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import MainScreen from "./MainScreen";
import ChessBoard from "./ChessBoard";
import SignUp from "./SignUp";
import Login from "./Login";
import Matching from "./Matching";
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
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "matching",
        element: <Matching />,
      },
    ],
  },
]);
export default router;
