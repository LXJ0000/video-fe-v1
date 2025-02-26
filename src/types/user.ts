export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
}

export interface LoginParams {
  username: string
  password: string
} 