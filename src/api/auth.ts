import { api } from "./client";
import {
  AuthResponse,
  UserProfile,
  LinkSkaterRequest,
  TossieReceipt,
  LinkRequest,
  ProfileCustomization,
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
  recentTossies: TossieReceipt[];
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

export const saveProfileCustomization = async (
  customization: ProfileCustomization
): Promise<UserProfile> => {
  const { data } = await api.put<UserProfile>("/user/profile", {
    customization,
  });
  return data;
};

export interface ImageUploadResponse {
  url: string; // The CDN URL of the uploaded image
}

export const uploadProfileImage = async (
  file: File,
  type: "profile" | "cover" | "gallery"
): Promise<ImageUploadResponse> => {
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const { data } = await api.post<ImageUploadResponse>(
    "/user/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
