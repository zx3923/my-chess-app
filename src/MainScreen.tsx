import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState } from "./recoil/atoms/userAtom";

interface TestTokenResponse {
  status: boolean;
  message?: string;
}

export default function MainScreen() {
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  const onStartClick = () => {
    navigate("/matching");
  };

  const signUpClick = () => {
    navigate("/signup");
  };

  const loginClick = () => {
    navigate("/login");
  };

  const testToken = async (): Promise<TestTokenResponse | null> => {
    try {
      const response = await fetch("http://localhost:8080/user/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 401) {
        console.log("액세스 토큰 만료. 리프레시 토큰을 사용해 갱신 시도...");
        const newToken = await refreshAccessToken();
        console.log(newToken);
        if (newToken) {
          user.token = newToken;
          return await testToken(); // 재귀 호출
        } else {
          throw new Error("새로운 토큰 발급 실패");
        }
      }

      const data: TestTokenResponse = await response.json();
      console.log(data);
      return data;
    } catch (e) {
      console.error("에러 발생:", e);
      return null; // 에러가 발생했을 경우 null 반환
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("http://localhost:8080/user/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });

      if (response.ok) {
        const data: { accessToken: string } = await response.json();
        console.log("새로운 액세스 토큰:", data.accessToken); // 갱신된 액세스 토큰을 출력
        return data.accessToken;
      } else {
        console.error("리프레시 토큰 실패:", response.status);
        return null;
      }
    } catch (e) {
      console.error("리프레시 토큰 요청 중 에러:", e);
      return null;
    }
  };

  const logoutClick = () => {
    setUser({
      isLoggedIn: false,
      userId: null,
      userName: "",
      token: null,
      refreshToken: null,
    });
    // navigate("/login");
  };
  console.log(user);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            체스 게임
          </h1>
          <p className="text-xl text-neutral-400 mb-8">
            최고의 온라인 체스 경험
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={onStartClick}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-neutral-100 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="게임 시작"
          >
            게임 시작
          </button>
          <div className="flex space-x-4">
            {user.isLoggedIn ? (
              <>
                <button
                  className="flex-1 px-6 py-2 bg-neutral-700 text-neutral-200 rounded-lg text-base font-medium hover:bg-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-opacity-50"
                  aria-label="로그인"
                  onClick={logoutClick}
                >
                  로그아웃
                </button>
                <button onClick={testToken}>토큰 확인</button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 px-6 py-2 bg-neutral-700 text-neutral-200 rounded-lg text-base font-medium hover:bg-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-opacity-50"
                  aria-label="로그인"
                  onClick={loginClick}
                >
                  로그인
                </button>
                <button
                  className="flex-1 px-6 py-2 bg-purple-600 text-neutral-200 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  aria-label="회원가입"
                  onClick={signUpClick}
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
