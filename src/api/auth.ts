import { api } from "./client";
import { AuthResponse, UserProfile } from "../types/auth";

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
  return data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>("/user/profile");
  return data;
};

export const requestSkaterLink = async (
  skaterId: number
): Promise<UserProfile> => {
  const { data } = await api.post<UserProfile>("/user/link-skater", {
    skaterId,
  });
  return data;
};
