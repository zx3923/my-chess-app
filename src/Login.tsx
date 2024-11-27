import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "./recoil/atoms/userAtom";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userState);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
      if (data.status) {
        setUser({
          isLoggedIn: true,
          userId: data.userId,
          userName: data.username,
          token: data.token,
          refreshToken: data.refreshToken,
        });
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const signUpClick = () => {
    navigate("/signup");
  };

  const mainClick = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="max-w-md w-full space-y-8 bg-neutral-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-200">
            로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                이메일 주소
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-700 placeholder-neutral-500 text-neutral-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-neutral-700"
                placeholder="이메일 주소"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-700 placeholder-neutral-500 text-neutral-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-neutral-700"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인
            </button>
          </div>
        </form>
        <div className="text-center space-y-2">
          <button
            className="font-medium text-blue-600 hover:text-blue-500"
            onClick={signUpClick}
          >
            계정이 없으신가요? 회원가입
          </button>
          <div>
            <button
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={mainClick}
            >
              메인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
