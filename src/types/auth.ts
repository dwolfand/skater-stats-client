export type UserStatus = "pending" | "approved" | "rejected";
export type UserRole = "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  skaterId?: number;
  status: UserStatus;
  role?: UserRole;
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
  skaterName?: string;
  role?: UserRole;
}

export interface TossieReceipt {
  id: number;
  fromUserId: string;
  fromUserName: string;
  fromUserPicture?: string;
  fromSkaterId?: number;
  fromSkaterName?: string;
  created_at: string;
  eventId: string;
  eventName: string;
  eventYear: number;
  ijsId: string;
  results_url: string;
  resultType: "event" | "six_event";
}

export interface LinkSkaterRequest {
  skaterId: number;
  usfsNumber: string;
  additionalInfo?: string;
}

export interface LinkRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  skaterId: number;
  usfsNumber: string;
  additionalInfo?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  skaterName: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}
