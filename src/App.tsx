import { useEffect, useState } from 'react'
import './App.css'
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


  return connectionStarted ? (
    <RemoteController
      host={host}
      port={port}
      setConnectionStarted={setConnectionStarted}
    />
  ) : (
    <>
      <div style={{ fontSize: "large", display: "grid", margin: "0 12px" }}>
        Host
        <input
          type="text"
          name="host"
          style={{ fontSize: "x-large" }}
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        Port
        <input
          type="text"
          name="port"
          style={{ fontSize: "x-large" }}
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
        <div style={{marginBottom: "12px"}} />
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
    </>
  );
}

export default App
