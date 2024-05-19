import { useEffect, useState } from 'react'
import './App.css'
import logo from '/logo.png'
import { RemoteController } from './components/RemoteController'

function App() {
  const [host, setHost] = useState<string>('192.168.')
  const [port, setPort] = useState<string>('')

  const [connectionStarted, setConnectionStarted] = useState<boolean>(false)

  const storeHostPort = () => {
    localStorage.setItem('storedHostPort', JSON.stringify({ host, port }))
  }
  const loadHostPort = () => {
    const storedHostPort = localStorage.getItem('storedHostPort')
    if (storedHostPort) {
      try {
        const { host, port } = JSON.parse(storedHostPort);
        setHost(host);
        setPort(port);
      } catch (e) {
        localStorage.removeItem('storedHostPort');
        console.error("Failed to parse stored host/port", e);
      }
    }
  }

  useEffect(() => {
    loadHostPort()
  }, [])

  const isSSL = window.location.protocol === 'https:'

  return connectionStarted ? (
    <RemoteController
      host={host}
      port={port}
      setConnectionStarted={setConnectionStarted}
    />
  ) : (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <img src={logo} alt="logo" style={{ width: "50%", height: "auto" }} />
        <h1 style={{ marginBottom: "12px" }}>Remote veadotube</h1>
        <p style={{ margin: "0 0 12px 0", color: "#8797a6" }}>
          Unofficial remote controller for{" "}
          <a href="https://veado.tube/" target="_blank">
            veadotube
          </a>
          .
        </p>
      </div>
      {isSSL ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            color: "red",
            fontSize: "large",
          }}
        >
          <p style={{ margin: "4px 24px" }}>
            This page cannot be used with SSL to connect via websocket of
            veadotube. Please use{" "}
            <a href={window.location.href.replace("https://", "http://")}>
              the http page
            </a>{" "}
            instead.
          </p>
        </div>
      ) : null}
      {!isSSL && (
        <div style={{ fontSize: "large", display: "grid", margin: "0 24px" }}>
          Host
          <input
            type="text"
            name="host"
            style={{ fontSize: "x-large", borderRadius: "8px" }}
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
          <div style={{ marginBottom: "12px" }} />
          Port
          <input
            type="text"
            name="port"
            style={{ fontSize: "x-large", borderRadius: "8px" }}
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <div style={{ marginBottom: "24px" }} />
          <button
            type="button"
            onClick={() => {
              storeHostPort();
              setConnectionStarted(true);
            }}
          >
            Connect
          </button>
        </div>
      )}
      <div style={{ marginBottom: "48px" }} />
      <footer
        style={{ display: "flex", flexDirection: "column", color: "#8797a6" }}
      >
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <p>
            <a
              href="https://github.com/satetsu888/remote-veadotube"
              target="_blank"
            >
              Github
            </a>
          </p>
          <p>
            <a href="https://buymeacoffee.com/satetsu888" target="_blank">
              Buy me a coffee
            </a>
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <p>
            Provided by{" "}
            <a href="https://x.com/satetsu888/" target="_blank">
              satetsu888
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default App
