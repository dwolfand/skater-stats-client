/// <reference types="@types/google.maps" />

interface Window {
  google: typeof google & {
    accounts?: {
      id: {
        initialize: (config: any) => void;
        renderButton: (element: HTMLElement, config: any) => void;
        prompt: () => void;
      };
    };
  };
}

declare module "@googlemaps/react-wrapper" {
  import React from "react";

  export interface WrapperProps {
    apiKey: string;
    children?: React.ReactNode;
    libraries?: string[];
    version?: string;
    language?: string;
    region?: string;
    loading?: React.ComponentType;
    loadingCallback?: () => void;
    render?: (status: Status) => React.ReactElement;
  }

  export enum Status {
    LOADING = "LOADING",
    FAILURE = "FAILURE",
    SUCCESS = "SUCCESS",
  }

  export class Wrapper extends React.Component<WrapperProps> {}
}
