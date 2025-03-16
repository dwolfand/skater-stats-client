import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          if (response.credential) {
            try {
              await login(response.credential);
              navigate("/");
            } catch (error) {
              console.error("Login failed:", error);
            }
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin")!,
        {
          theme: "outline",
          size: "large",
          type: "standard",
        }
      );
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = initializeGoogleSignIn;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Skater Stats
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your skating profile and more
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <div id="google-signin"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
