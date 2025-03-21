import { useAuth } from "../context/AuthContext";

export function useAdmin() {
  const { profile } = useAuth();
  return profile?.role === "admin";
}
