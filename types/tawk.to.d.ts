// types/tawk.to.d.ts
export {};

declare global {
  interface Window {
    Tawk_API?: {
      showWidget: () => void;
      hideWidget: () => void;
      maximize: () => void;
      minimize: () => void;
      toggle: () => void;
      popup: () => void;
      getWindowType: () => string;
      onLoad: (func: Function) => void;
      onStatusChange: (func: Function) => void;
      onBeforeLoad: (func: Function) => void;
      onChatMaximized: (func: Function) => void;
      onChatMinimized: (func: Function) => void;
      onChatHidden: (func: Function) => void;
      onChatStarted: (func: Function) => void;
      onChatEnded: (func: Function) => void;
      onPrechatSubmit: (func: Function) => void;
      onOfflineSubmit: (func: Function) => void;
      onAgentJoin: (func: Function) => void;
      onAgentLeave: (func: Function) => void;
      onMessageSent: (func: Function) => void;
      onMessageReceived: (func: Function) => void;
      onTagsUpdated: (func: Function) => void;
      onUnreadCountChanged: (func: Function) => void;
      onVisitorNameChanged: (func: Function) => void;
      [key: string]: any;
    };
    Tawk_LoadStart?: Date;
  }
}
