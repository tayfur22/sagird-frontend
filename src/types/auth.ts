export type Role = "STUDENT" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone: string | null;
  grade: number | null;
  school: string | null;
  city: string | null;
  createdAt: string;
}

/** Body of login / register / refresh / change-password responses. */
export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone: string | null;
  grade: number | null;
  school: string | null;
  city: string | null;
}
