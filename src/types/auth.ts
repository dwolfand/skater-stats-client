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

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface ImageData {
  url: string;
  thumbnails?: {
    small: string;
    medium: string;
  };
}

// Map location types
export type MapLocationType =
  | "hometown"
  | "current"
  | "training"
  | "competition"
  | "visited"
  | "performance"
  | "other";

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: MapLocationType;
  address: string;
  description?: string;
  readOnly?: boolean;
}

export interface ProfileCustomization {
  // Theme & Layout
  accentColor?: string;
  backgroundColor?: string;
  fontFamily?: string;

  // Personal Info
  bio?: string;
  favoriteQuote?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Skating Info
  coach?: string;
  homeRink?: string;
  achievements?: string[];
  goals?: string;
  canBeFeatured?: boolean;

  // Media
  profileImage?: ImageData;
  coverImage?: ImageData;
  galleryImages?: ImageData[];
  featuredVideo?: string;
  profileSong?: {
    title?: string;
    artist?: string;
    url?: string;
  };

  // Preferences
  unsubscribeFromEmail?: boolean;

  // Map Locations
  mapLocations?: MapLocation[];
}

export interface Club {
  id: number;
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  role?: UserRole;
  status?: UserStatus;
  skaterId?: number;
  usfsNumber?: string;
  skaterName?: string;
  currentClub?: string;
  clubHistory?: Club[];
  competitionLocations?: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
    description?: string;
  }>;
  customization?: ProfileCustomization;
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
  is_opened: boolean;
  tossie_type?: string;
}

export interface AdminTossieReceipt extends TossieReceipt {
  toSkaterId: number;
  toSkaterName: string;
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
