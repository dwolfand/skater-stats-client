import { api } from "./client";
import {
  AuthResponse,
  UserProfile,
  LinkSkaterRequest,
  TossieReceipt,
  LinkRequest,
  ProfileCustomization,
  AdminTossieReceipt,
} from "../types/auth";
import { flagRecentlyUploaded } from "../utils/images";

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
  recentTossies: AdminTossieReceipt[];
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
  uploadUrl: string;
  fileUrl: string;
  thumbnailUrls?: {
    small: string;
    medium: string;
  };
}

export const getImageUploadUrl = async (
  file: File,
  imageType: "profile" | "cover" | "gallery"
): Promise<ImageUploadResponse> => {
  const { data } = await api.post<ImageUploadResponse>(
    "/user/generate-upload-url",
    {
      fileName: file.name,
      contentType: file.type,
      imageType,
    }
  );
  return data;
};

export const uploadImageToS3 = async (
  file: File,
  uploadUrl: string
): Promise<void> => {
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "content-type": file.type,
    },
  });
};

export const handleImageUpload = async (
  file: File,
  imageType: "profile" | "cover" | "gallery"
): Promise<{
  fileUrl: string;
  thumbnailUrls?: { small: string; medium: string };
}> => {
  // Get the pre-signed URL
  const { uploadUrl, fileUrl, thumbnailUrls } = await getImageUploadUrl(
    file,
    imageType
  );

  // Upload the file directly to S3
  await uploadImageToS3(file, uploadUrl);

  // Return the final file URL and thumbnail URLs
  return { fileUrl, thumbnailUrls };
};

export const openTossie = async (tossieId: number): Promise<TossieReceipt> => {
  const { data } = await api.put<TossieReceipt>(
    `/user/tossie-receipts/${tossieId}/open`
  );
  return data;
};
