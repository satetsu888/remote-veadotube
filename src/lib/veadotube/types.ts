export type Event = 'websocketStatusChanged' | 'statesChanged' | 'stateChanged';
export type EventListener = () => void;

export type WebsocketConnectingErrorType = "WebsocketConnectingError"
export type WebsocketErrorType = "WebsocketError"
export type WebsocketTimeoutErrorType = "WebsocketTimeoutError"

export type VeadotubeClientError = {
  type: WebsocketConnectingErrorType | WebsocketErrorType | WebsocketTimeoutErrorType
  message: string
  additionalInfo: string
}

export const WebsocketConnectingError: VeadotubeClientError = {
  type: "WebsocketConnectingError",
  message: "Failed to open websocket connection.",
  additionalInfo: "Make sure the port number is correct."
}

export const WebsocketError: VeadotubeClientError = {
  type: "WebsocketError",
  message: "Websocket error.",
  additionalInfo: "Make sure the host address and port number are correct. And the websocket server is running."
}

export const WebsocketTimeoutError: VeadotubeClientError = {
  type: "WebsocketTimeoutError",
  message: "Websocket connection timeout.",
  additionalInfo: "Make sure the host address is correct. And the websocket server is running."
} 

export type ServerConfig = {
  host: string
  port: string
  clientName: string
  onCloseCallback?: (e: CloseEvent) => void
  onErrorCallback?: (e: VeadotubeClientError) => void
}

export type StateImage = {
  width: number
  height: number
  data: string
}

export type State = {
  id: string
  name: string
  image: StateImage | null
}

export type StateEventResult = listStatesEventResult | peekStateEventResult | thumbStateEventResult

export type listStatesEventResult = {
  event: "list"
  states: State[]
}

export type peekStateEventResult = {
  event: "peek"
  state: string
}

export type thumbStateEventResult = {
  event: "thumb"
  stateId: string
  width: number
  height: number
  png: string
}
