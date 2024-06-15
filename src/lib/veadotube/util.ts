import { StateEventResult } from "./types";

export const parseReceivedPayload = (event: MessageEvent<string>): StateEventResult | undefined  => {
    let str = event.data
    str = str.replace(/.*nodes:/, "")
    str = str.replaceAll("\u0000", "");

    const json = JSON.parse(str);

    if (json.event !== "payload") {
        // TODO: event handling for other messages
        return
    }

    switch (json.payload.event) {
        case "list":
            return {
                event: "list",
                states: json.payload.states
            }
        case "peek":
            return {
                event: "peek",
                state: json.payload.state
            }
        case "thumb":
            return {
                event: "thumb",
                stateId: json.payload.state,
                width: json.payload.width,
                height: json.payload.height,
                png: json.payload.png
            }
    }
}