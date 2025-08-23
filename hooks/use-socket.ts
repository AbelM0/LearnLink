import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket() {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    return () => {
      socket.current?.disconnect();
      console.log("❌ Disconnected from socket server");
    };
  }, []);

  return socket;
}
