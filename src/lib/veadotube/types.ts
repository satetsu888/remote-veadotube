export type ServerConfig = {
  host: string
  port: string
  clientName: string
  onCloseCallback?: (e: Event) => void
  onErrorCallback?: (e: Event) => void
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
