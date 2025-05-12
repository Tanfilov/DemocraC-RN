declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// Capacitor types for global window object
interface Window {
  Capacitor?: {
    isPluginAvailable: (name: string) => boolean;
    Plugins?: {
      App?: {
        addListener: (event: string, callback: (state: { isActive: boolean }) => void) => void;
        removeAllListeners: () => void;
      };
    };
  };
}