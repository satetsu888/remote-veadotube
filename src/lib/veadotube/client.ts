import { messages } from "./message";
import { ServerConfig, State } from "./types";
import { parseReceivedPayload } from "./util";

export class VeadotubeClient {
    private config: ServerConfig;

    private websocket: WebSocket | null;
    private states: State[];
    private currentStateId: string | null;

    constructor(config: ServerConfig) {
        this.config = config;

        this.websocket = null;
        this.states = [];
        this.currentStateId = null;
    }

    onMessage = (event: MessageEvent<string>) => {
        const payloadEventResult = parseReceivedPayload(event);

        if (!payloadEventResult) {
            return;
        }

        switch (payloadEventResult.event) {
            case "list":
                this.states = payloadEventResult.states;
                for (const state of this.states) {
                    this.callStateThumb(state.id);
                }
                break;
            case "peek":
                // NOTE: do something with peek event ?
                break;
            case "thumb":
                this.states = this.states.map((state) => {
                    if (state.id === payloadEventResult.stateId) {
                        return {
                            ...state,
                            image: {
                                width: payloadEventResult.width,
                                height: payloadEventResult.height,
                                data: payloadEventResult.png
                            }
                        }
                    }
                    return state;
                })
                break;
        }
    }

    open = (initializeWithListStates:boolean = true) => {
        const ws = new WebSocket(`ws://${this.config.host}:${this.config.port}?n=${this.config.clientName}`);
        console.debug("opening websocket connection to", this.config.host, this.config.port);

        ws.addEventListener("message", this.onMessage)

        ws.addEventListener("open", () => {
            if (initializeWithListStates) {
                this.listStates();
            }
        })

        this.websocket = ws;
    }

    close = () => {
        this.websocket?.close();
    }

    sendRaw = (message: string) => {
        this.websocket?.send(message);
    }

    setState = (stateId: string) => {
        this.currentStateId = stateId;
        this.sendRaw(messages.SET_STATE(stateId));
    }

    listStates = () => {
        this.sendRaw(messages.LIST_STATES());
    }

    callStateThumb = (stateId: string) => {
        this.sendRaw(messages.CALL_STATE_THUMB({ id: stateId }));
    }

    getStates = () => {
        return this.states;
    }

    getCurrentStateId = () => {
        return this.currentStateId;
    }
}
