import { atom } from "recoil";

export const userState = atom({
  key: "userState", // 고유한 key
  default: {
    isLoggedIn: false, // 로그인 여부
    userId: null, // 유저 ID
    userName: "", // 유저명
    token: null, // 인증 토큰
  },
});
