// src/users/interfaces/user.interface.ts

export interface User {
    id: number;             // 사용자 고유 ID
    username: string;       // 사용자명
    password: string;       // 비밀번호 (해시된 형태로 저장)
    email: string;         // 이메일 (선택적)
    createdAt: Date;       // 가입일 (선택적)
  }
  