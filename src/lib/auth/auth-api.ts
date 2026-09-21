import { apiClient } from "@/lib/api/client";
import type {
  AuthSession,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  User,
} from "@/types/auth";

/** Thin typed wrappers over the backend auth/profile endpoints. */
export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<AuthSession>("/auth/register", input, { skipAuth: true }),
  login: (input: LoginInput) => apiClient.post<AuthSession>("/auth/login", input, { skipAuth: true }),
  refresh: () => apiClient.post<AuthSession>("/auth/refresh", undefined, { skipAuth: true }),
  logout: () => apiClient.post<void>("/auth/logout", undefined, { skipAuth: true }),
  me: () => apiClient.get<User>("/auth/me"),
  changePassword: (input: ChangePasswordInput) =>
    apiClient.post<AuthSession>("/auth/change-password", input),
  getProfile: () => apiClient.get<User>("/students/me"),
  updateProfile: (input: UpdateProfileInput) => apiClient.put<User>("/students/me", input),
};
