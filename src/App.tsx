import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [states, setStates] = useState<{ id: string; name: string }[]>([])
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

  useEffect(() => {
    const websocket = new WebSocket('ws://127.0.0.1:64205?n=name')
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

    const onMessage = (event: MessageEvent<string>) => {
      const str = event.data.replace(/.*nodes:/, '').replaceAll('\u0000', '')
      const json = JSON.parse(str)
      if (json.entries) {
        console.log('entries', json.entries)
      }

      if (json.event === 'payload') {
        const payload = json.payload

        if (payload.event === 'list') {
          setStates(payload.states)
        }
      console.log('json', json)
      }
    }
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
            key={state.id}
            onClick={() => {
              socketRef.current?.send(
                STATE_EVENTS_PAYLOAD(`{"event": "set", "state": "${state.id}"}`)
              );
            }}
          >
            {state.name}
          </button>
        ))}
      </div>
    </>
  );
}

export default App
