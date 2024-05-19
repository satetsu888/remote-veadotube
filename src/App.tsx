import { useEffect, useRef, useState } from 'react'
import './App.css'

type StateImage = {
  width: number
  height: number
  data: string
}

type State = {
  id: string
  name: string
  image: StateImage | null
}

function App() {
  const [states, setStates] = useState<State[]>([])
  const [currentStateId, setCurrentStateId] = useState<string | null>(null)
  const socketRef = useRef<WebSocket>()

  const INITIAL_LIST_EVENT_PAYLOAD = 'nodes: {"event": "list"}'
  const STATE_EVENTS_PAYLOAD = (input: string) => {
    return `nodes: {
      "event": "payload",
      "type": "stateEvents",
      "id": "mini",
      "payload": ${input}
    }`;
  };

    const onMessage = (event: MessageEvent<string>) => {
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
    }

  useEffect(() => {
    const websocket = new WebSocket('ws://127.0.0.1:49860?n=name')
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
    })

    websocket.addEventListener('message', onMessage)

    return () => {
      websocket.close()
      websocket.removeEventListener('message', onMessage)
      websocket.removeEventListener('open', () => {})
      websocket.removeEventListener('close', () => {})
      websocket.removeEventListener('error', () => {})
    }
  }, [])

  return (
    <>
      <div style={{display: "flex", margin: "0 4px 0 4px", gap: "4px", flexWrap: "wrap", justifyContent: "center"}}>
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

export default App
