import { useRef, useState, useSyncExternalStore } from "react";
import { VeadotubeClient } from "../lib/veadotube/client";
import { VeadotubeClientError } from "../lib/veadotube/types";

export const useVeadotube = (
  host: string,
  port: string,
  onCloseCallback?: (e: CloseEvent) => void
) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onError = (e: VeadotubeClientError) => {
    setErrorMessage(`${e.message}${e.additionalInfo}`)
  }

  const veadotubeClientRef = useRef<VeadotubeClient>(
    new VeadotubeClient({
      host,
      port,
      clientName: "remote-veadotube",
      onCloseCallback,
      onErrorCallback: onError,
    })
  );

  const start = () => {
    const websocketState = veadotubeClientRef.current.websocket?.readyState
    if (websocketState === WebSocket.OPEN || websocketState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setErrorMessage(null);
      veadotubeClientRef.current.open();
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message)
      } else {
        setErrorMessage("Failed to open websocket connection")
      }
    }
  };

  const close = () => {
    const websocketState = veadotubeClientRef.current.websocket?.readyState
    if (websocketState === WebSocket.CLOSING || websocketState === WebSocket.CONNECTING) {
      return;
    }

    veadotubeClientRef.current.close();
  }

  const states = useSyncExternalStore(
    (onStoreChange: () => void) => {
      veadotubeClientRef.current.addEventListener("statesChanged", () => {
        onStoreChange();
      });

      return () => {
        veadotubeClientRef.current.removeEventListener(
          "statesChanged",
          onStoreChange
        );
      };
    },
    () => veadotubeClientRef.current.getStates()
  )

  const currentStateId = useSyncExternalStore(
    (onStoreChange: () => void) => {
      veadotubeClientRef.current.addEventListener("stateChanged", () => {
        onStoreChange();
      });

      return () => {
        veadotubeClientRef.current.removeEventListener(
          "stateChanged",
          onStoreChange
        );
      };
    },
    () => veadotubeClientRef.current.getCurrentStateId()
  )

  const setState = (stateId: string) => veadotubeClientRef.current.setState(stateId)

  const websocketState = useSyncExternalStore(
    (onStoreChange: () => void) => {
      veadotubeClientRef.current.addEventListener("websocketStatusChanged", () => {
        onStoreChange();
      });

      return () => {
        veadotubeClientRef.current.removeEventListener(
          "websocketStatusChanged",
          onStoreChange
        );
      };
    },
    () => veadotubeClientRef.current.websocket?.readyState
  );

  return {
    start,
    close,
    states,
    currentStateId,
    setState,
    websocketState,
    errorMessage,
  };
};
