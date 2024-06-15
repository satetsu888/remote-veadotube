import { messages } from "./message";
import {
  Event,
  EventListener,
  ServerConfig,
  State,
  WebsocketConnectingError,
  WebsocketError,
  WebsocketTimeoutError,
} from "./types";
import { parseReceivedPayload } from "./util";

export class VeadotubeClient {
  private config: ServerConfig;
  public websocket: WebSocket | null;
  private veadotubeStates: State[];
  private currentStateId: string | null;
  private timeoutTimerId: number | null;

  private subscribers: {
    [key in Event]: Set<EventListener>;
  } = {
    websocketStatusChanged: new Set(),
    statesChanged: new Set(),
    stateChanged: new Set(),
  };

  constructor(config: ServerConfig) {
    this.config = config;

    this.websocket = null;
    this.veadotubeStates = [];
    this.currentStateId = null;

    this.timeoutTimerId = null;
  }

  addEventListener = (type: Event, listener: EventListener) => {
    this.subscribers[type].add(listener);
  };

  removeEventListener = (type: Event, listener: EventListener) => {
    this.subscribers[type].delete(listener);
  };

  dispatchEvent(event: Event): void {
    for (const listener of this.subscribers[event]) {
      listener();
    }
  }

  reset = () => {
    this.stopTimeoutTimer();

    this.websocket = null;
    this.veadotubeStates = [];
    this.currentStateId = null;

    this.dispatchEvent("websocketStatusChanged");
    this.dispatchEvent("statesChanged");
    this.dispatchEvent("stateChanged");
  };

  startTimeoutTimer = () => {
    if (this.timeoutTimerId) {
      return;
    }

    this.timeoutTimerId = window.setTimeout(() => {
      if (this.config.onErrorCallback) {
        this.config.onErrorCallback(WebsocketTimeoutError);
      } else {
        console.error("timeout occurred");
      }
    }, 3000);
  };

  stopTimeoutTimer = () => {
    if (this.timeoutTimerId) {
      clearTimeout(this.timeoutTimerId);
      this.timeoutTimerId = null;
    }
  };

  onMessage = (event: MessageEvent<string>) => {
    this.stopTimeoutTimer();
    const payloadEventResult = parseReceivedPayload(event);

    if (!payloadEventResult) {
      return;
    }

    switch (payloadEventResult.event) {
      case "list":
        this.veadotubeStates = payloadEventResult.states;
        for (const state of this.veadotubeStates) {
          this.callStateThumb(state.id);
        }
        this.dispatchEvent("statesChanged");
        break;
      case "peek":
        // NOTE: do something with peek event ?
        break;
      case "thumb":
        this.veadotubeStates = this.veadotubeStates.map((state) => {
          if (state.id === payloadEventResult.stateId) {
            return {
              ...state,
              image: {
                width: payloadEventResult.width,
                height: payloadEventResult.height,
                data: payloadEventResult.png,
              },
            };
          }
          return state;
        });
        this.dispatchEvent("statesChanged");
        break;
    }
  };

  open = (initializeWithListStates: boolean = true) => {
    try {
      this.innerOpen(initializeWithListStates);
    } catch (e) {
      this.reset();

      if (this.config.onErrorCallback) {
        this.config.onErrorCallback(WebsocketConnectingError);
      } else {
        console.error("failed to open websocket connection", e);
      }
    }
  };

  innerOpen = (initializeWithListStates: boolean) => {
    this.startTimeoutTimer();
    const ws = new WebSocket(
      `ws://${this.config.host}:${this.config.port}?n=${this.config.clientName}`
    );
    console.debug(
      "opening websocket connection to",
      this.config.host,
      this.config.port
    );

    ws.addEventListener("message", this.onMessage);

    ws.addEventListener("open", () => {
      this.stopTimeoutTimer();
      if (initializeWithListStates) {
        this.listStates();
      }
      this.dispatchEvent("websocketStatusChanged");
    });

    ws.addEventListener("close", (e) => {
      if (this.config.onCloseCallback) {
        this.config.onCloseCallback(e);
      }

      this.reset();
      this.dispatchEvent("websocketStatusChanged");
    });

    ws.addEventListener("error", (e) => {
      this.reset();

      if (this.config.onErrorCallback) {
        this.config.onErrorCallback(WebsocketError);
      } else {
        console.error("websocket error", e);
      }
    });

    this.websocket = ws;
    this.dispatchEvent("websocketStatusChanged");
  };

  close = () => {
    this.websocket?.close();
  };

  sendRaw = (message: string) => {
    this.startTimeoutTimer();
    this.websocket?.send(message);
  };

  setState = (stateId: string) => {
    this.currentStateId = stateId;
    this.dispatchEvent("stateChanged");
    this.sendRaw(messages.SET_STATE(stateId));
  };

  listStates = () => {
    this.sendRaw(messages.LIST_STATES());
  };

  callStateThumb = (stateId: string) => {
    this.sendRaw(messages.CALL_STATE_THUMB({ id: stateId }));
  };

  getStates = () => {
    return this.veadotubeStates;
  };

  getCurrentStateId = () => {
    return this.currentStateId;
  };
}
