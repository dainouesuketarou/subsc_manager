// ユーザー関連のDTO

export interface UserDTO {
  id: string;
  email: string;
  passwordHash?: string;
  supabaseUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  passwordHash?: string;
  supabaseUserId?: string;
}

export interface UpdateUserDTO {
  id: string;
  email?: string;
  supabaseUserId?: string;
}

export interface UserResponseDTO {
  user: UserDTO;
}

export interface UsersResponseDTO {
  users: UserDTO[];
}
