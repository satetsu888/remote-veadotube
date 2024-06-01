import { useEffect } from "react"
import { useVeadotube } from "../hooks/useVeadotube"

type Props = {
  host: string,
  port: string,
  setConnectionStarted: (value: boolean) => void
}

export const RemoteController = ({host, port, setConnectionStarted}: Props) => {
  const { start, messageReceived, states, currentStateId, setCurrentState } = useVeadotube(
    host,
    port,
    () => {
      if (import.meta.env.PROD) {
        setConnectionStarted(false);
      }
    }
  );

  useEffect(() => {
    start();
  }, [start]);

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
              setCurrentState(state.id)
            }}
          >
            {state.image ? <img src={`data:image/png;base64,${state.image.data}`} alt={state.name} width={state.image.width} height={state.image.height} /> : state.name}
          </button>
        ))}
      </div>
    </>
  );
}
