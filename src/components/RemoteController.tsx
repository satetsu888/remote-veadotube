import { useCallback, useEffect, useRef, useState } from "react"
import { State } from "../types"

type Props = {
  host: string,
  port: string,
  setConnectionStarted: (value: boolean) => void
}

export const RemoteController = ({host, port, setConnectionStarted}: Props) => {
  const [states, setStates] = useState<State[]>([])
  const [currentStateId, setCurrentStateId] = useState<string | null>(null)
  const socketRef = useRef<WebSocket>()
  const messageReceived = useRef(false)

  const INITIAL_LIST_EVENT_PAYLOAD = 'nodes: {"event": "list"}'
  const STATE_EVENTS_PAYLOAD = (input: string) => {
    return `nodes: {
      "event": "payload",
      "type": "stateEvents",
      "id": "mini",
      "payload": ${input}
    }`;
  };

  const onMessage = useCallback((event: MessageEvent<string>) => {
    messageReceived.current = true

    const str = event.data.replace(/.*nodes:/, '').replaceAll('\u0000', '')
    const json = JSON.parse(str)

    if (json.event === 'payload') {
      const payload = json.payload

      switch (payload.event) {
        case 'list':
          setStates(payload.states)
          for (const state of payload.states) {
            socketRef.current?.send(
              STATE_EVENTS_PAYLOAD(`{"event": "thumb", "state": "${state.id}"}`)
            );
          }
          break
        case 'thumb':
          setStates((prev) => {
            const newState = prev.map((state) => {
              if (state.id === payload.state) {
                return { ...state, image: {
                  width: payload.width,
                  height: payload.height,
                  data: payload.png,
                } }
              }
              return state
            })
            return newState
          })
          break
      }

    }
    console.log('json', json)
  },[])

  useEffect(() => {
    const websocket = new WebSocket(`ws://${host}:${port}?n=remote-veadotube`)
    socketRef.current = websocket

    websocket.addEventListener('open', () => {
      console.log('open')
      websocket.send(INITIAL_LIST_EVENT_PAYLOAD)
      websocket.send(STATE_EVENTS_PAYLOAD('{"event": "list"}'))
    })

    websocket.addEventListener('close', () => {
      console.log('close')
    })

    websocket.addEventListener('error', (event) => {
      console.error('error', event)

      if (event.type === 'error') {
        if (import.meta.env.PROD){
          setConnectionStarted(false)
        }
      }
    })

    websocket.addEventListener('message', onMessage)

    const timeout = setTimeout(() => {
      if (!messageReceived.current) {
        websocket.close()
        setConnectionStarted(false)
        alert('Connection timed out. No response from server.')
      }
    }, 3000)

    return () => {
      websocket.close()
      websocket.removeEventListener('message', onMessage)
      websocket.removeEventListener('open', () => {})
      websocket.removeEventListener('close', () => {})
      websocket.removeEventListener('error', () => {})
      clearTimeout(timeout)
    }
  }, [onMessage, host, port, setConnectionStarted])

  return (
    <>
      <div style={{display: "flex", margin: "0 4px 0 4px", gap: "4px", flexWrap: "wrap", justifyContent: "center"}}>
        { messageReceived.current ? null : <p>Connecting to {host}:{port} ...</p>}
        {states.map((state) => (
          <button
            type="button"
            style={state.id === currentStateId ? { backgroundColor: 'lightblue' } : {}}
            key={state.id}
            onClick={() => {
              socketRef.current?.send(
                STATE_EVENTS_PAYLOAD(`{"event": "set", "state": "${state.id}"}`)
              );
              setCurrentStateId(state.id)
            }}
          >
            {state.image ? <img src={`data:image/png;base64,${state.image.data}`} alt={state.name} width={state.image.width} height={state.image.height} /> : state.name}
          </button>
        ))}
      </div>
    </>
  );
}
