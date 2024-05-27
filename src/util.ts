export const storeHostPort = (host: string, port: string) => {
  localStorage.setItem("storedHostPort", JSON.stringify({ host, port }));
};

export const loadHostPort = (): { host: string; port: string } => {
  const storedHostPort = localStorage.getItem("storedHostPort");
  if (storedHostPort) {
    try {
      const { host, port } = JSON.parse(storedHostPort);
      return { host, port };
    } catch (e) {
      localStorage.removeItem("storedHostPort");
      console.error("Failed to parse stored host/port", e);
    }
  }

  return { host: "", port: "" };
};
