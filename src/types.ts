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
