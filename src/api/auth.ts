import { api } from "./client";
import {
  AuthResponse,
  UserProfile,
  LinkSkaterRequest,
  TossieReceipt,
} from "../types/auth";

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
  return data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>("/user/profile");
  return data;
};

export const getTossieReceipts = async (): Promise<TossieReceipt[]> => {
  const { data } = await api.get<TossieReceipt[]>("/user/tossie-receipts");
  return data;
};

export const requestSkaterLink = async (
  skaterId: number,
  usfsNumber: string,
  additionalInfo?: string
): Promise<UserProfile> => {
  const payload: LinkSkaterRequest = {
    skaterId,
    usfsNumber,
    additionalInfo,
  };
  const { data } = await api.post<UserProfile>("/user/link-skater", payload);
  return data;
};
