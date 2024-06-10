import { useEffect } from "react"
import { useVeadotube } from "../hooks/useVeadotube"

type Props = {
  host: string,
  port: string,
}

export const RemoteController = ({host, port}: Props) => {
  const { start, close, states, currentStateId, setState, websocketState, errorMessage } = useVeadotube(
    host,
    port,
  );

  useEffect(() => {
    start();
    return () => {
      close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMessage) {
    return (
      <>
        <div
          style={{
            display: "flex",
            margin: "0 4px 0 4px",
            gap: "4px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <p style={{ margin: "4px", width: "100%" }}>{errorMessage}</p>
          <button onClick={() => window.location.reload()}>Go Back</button>
        </div>
      </>
    );
  }

  if (websocketState === WebSocket.CONNECTING) {
        return <p>Connecting to {host}:{port} ...</p>
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          margin: "0 4px 0 4px",
          gap: "4px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {states.map((state) => (
          <button
            type="button"
            style={
              state.id === currentStateId
                ? { backgroundColor: "lightblue" }
                : {}
            }
            key={state.id}
            onClick={() => {
              setState(state.id);
            }}
          >
            {state.image ? (
              <img
                src={`data:image/png;base64,${state.image.data}`}
                alt={state.name}
                width={state.image.width}
                height={state.image.height}
              />
            ) : (
              state.name
            )}
          </button>
        ))}
      </div>
    </>
  );
}
