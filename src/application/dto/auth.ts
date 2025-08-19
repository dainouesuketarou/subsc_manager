// 認証関連のDTO

export interface AuthUserDTO {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
  session: unknown;
  message?: string;
}

export interface PasswordResetDTO {
  email: string;
}

export interface PasswordUpdateDTO {
  password: string;
}

export interface AuthErrorDTO {
  error: string;
}
