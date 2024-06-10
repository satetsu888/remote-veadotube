import { useEffect, useState } from 'react'
import "./App.css";
import { RemoteController } from "./components/RemoteController";
import { Top } from "./components/Top";
import { loadHostPort } from "./util";

function App() {
  const [host, setHost] = useState<string>("192.168.");
  const [port, setPort] = useState<string>("");

  const [connectionStarted, setConnectionStarted] = useState<boolean>(false);

  useEffect(() => {
    const { host, port } = loadHostPort();
    if (host) setHost(host);
    if (port) setPort(port);
  }, []);

  return connectionStarted ? (
    <RemoteController
      host={host}
      port={port}
    />
  ) : (
    <Top
      host={host}
      setHost={setHost}
      port={port}
      setPort={setPort}
      setConnectionStarted={setConnectionStarted}
    />
  );
}

export default App
