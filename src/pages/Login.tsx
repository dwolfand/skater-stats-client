import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginModalContext } from "../components/LoginModal";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  "968418043401-c0nnio4ubtfruq0n0733891a0o3252uv.apps.googleusercontent.com";

export const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { openLoginModal } = React.useContext(LoginModalContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      openLoginModal("Sign in to access your account");
    }
  }, [isAuthenticated, navigate, openLoginModal]);

  // Return null since we're using the modal
  return null;
};
