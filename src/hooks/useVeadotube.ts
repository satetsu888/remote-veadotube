import { useCallback, useEffect, useRef, useState } from "react";
import { State } from "../types";

export const useVeadotube = (
  host: string,
  port: string,
  onCloseCallback: (e: Event) => void
) => {
  const [connectionStarted, setConnectionStarted] = useState<boolean>(false);

  const [states, setStates] = useState<State[]>([]);
  const [currentStateId, setCurrentStateId] = useState<string | null>(null);
  const websocketRef = useRef<WebSocket>();
  const messageReceived = useRef(false);

  const INITIAL_LIST_EVENT_PAYLOAD = 'nodes: {"event": "list"}';
  const STATE_EVENTS_PAYLOAD = (input: string) => {
    return `nodes: {
      "event": "payload",
      "type": "stateEvents",
      "id": "mini",
      "payload": ${input}
    }`;
  };

  const start = () => {
    setConnectionStarted(true);
  };

  const setCurrentState = (stateId: string) => {
    websocketRef.current?.send(
      STATE_EVENTS_PAYLOAD(`{"event": "set", "state": "${stateId}"}`)
    );
    setCurrentStateId(stateId);
  };

  const onMessage = useCallback((event: MessageEvent<string>) => {
    messageReceived.current = true;

    const str = event.data.replace(/.*nodes:/, "").replaceAll("\u0000", "");
    const json = JSON.parse(str);

    if (json.event === "payload") {
      const payload = json.payload;

      switch (payload.event) {
        case "list":
          setStates(payload.states);
          for (const state of payload.states) {
            websocketRef.current?.send(
              STATE_EVENTS_PAYLOAD(`{"event": "thumb", "state": "${state.id}"}`)
            );
          }
          break;
        case "thumb":
          setStates((prev) => {
            const newState = prev.map((state) => {
              if (state.id === payload.state) {
                return {
                  ...state,
                  image: {
                    width: payload.width,
                    height: payload.height,
                    data: payload.png,
                  },
                };
              }
              return state;
            });
            return newState;
          });
          break;
      }
    }
    console.log("json", json);
  }, []);

  useEffect(() => {
    console.log("connectionStarted", connectionStarted)
    if (!connectionStarted) {
      return;
    }

    try {
      const websocket = new WebSocket(
        `ws://${host}:${port}?n=remote-veadotube`
      );
      websocketRef.current = websocket;

      websocket.addEventListener("open", () => {
        console.log("open");
        websocket.send(INITIAL_LIST_EVENT_PAYLOAD);
        websocket.send(STATE_EVENTS_PAYLOAD('{"event": "list"}'));
      });

      websocket.addEventListener("close", (event) => {
        console.log("close");
        onCloseCallback(event);
      });

      websocket.addEventListener("error", (event) => {
        console.error("error", event);

        if (event instanceof Error) {
          setConnectionStarted(false);
          alert(event.message);
        }
      });

      websocket.addEventListener("message", onMessage);

      const timeout = setTimeout(() => {
        if (!messageReceived.current) {
          websocket.close();
          setConnectionStarted(false);
          alert("Connection timed out. No response from server.");
        }
      }, 3000);

      return () => {
        websocket.close();
        websocket.removeEventListener("message", onMessage);
        websocket.removeEventListener("open", () => {});
        websocket.removeEventListener("close", () => {});
        websocket.removeEventListener("error", () => {});
        clearTimeout(timeout);
      };
    } catch (error) {
      console.error("error", error);
      if (error instanceof Error) {
        setConnectionStarted(false);
        alert(error.message);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStarted]);

  return {
    start,
    messageReceived,
    states,
    currentStateId,
    setCurrentState,
  };
};
