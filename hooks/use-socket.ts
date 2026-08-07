"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const connection = io("https://learnlink-render-socket.onrender.com", {
      transports: ["websocket"],
    });

    setSocket(connection);

    return () => {
      connection.disconnect();
    };
  }, []);

  return socket;
}
