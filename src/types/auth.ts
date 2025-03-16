export type UserStatus = "active" | "pending_verification" | "disabled";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  skaterId?: number;
  status: UserStatus;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  skaterId?: number;
  status: UserStatus;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
}
