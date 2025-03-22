import { api } from "./client";
import {
  AuthResponse,
  UserProfile,
  LinkSkaterRequest,
  TossieReceipt,
  LinkRequest,
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

export interface AdminInfo {
  linkRequests: LinkRequest[];
  userCount: number;
  tossieCount: number;
}

export const getAdminInfo = async (): Promise<AdminInfo> => {
  const { data } = await api.get<AdminInfo>("/admin/info");
  return data;
};

export const updateLinkRequestStatus = async (
  requestId: string,
  status: "pending" | "approved" | "rejected"
): Promise<LinkRequest> => {
  const { data } = await api.put<LinkRequest>(`/admin/link-requests/status`, {
    requestId,
    status,
  });
  return data;
};
