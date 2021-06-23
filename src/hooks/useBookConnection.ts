import { useEffect } from "react";

// @TODO: Complete hook
function useBookConnection() {
  let socket;

  useEffect(() => {
    const socket = new WebSocket("wss://www.cryptofacilities.com/ws/v1");

    socket.addEventListener("open", (event) => {
      // Send message to start connection
      socket.send(
        JSON.stringify({
          event: "subscribe",
          feed: "book_ui_1",
          product_ids: ["PI_XBTUSD"],
        })
      );
    });

    socket.addEventListener("message", (event) => {
      console.log("new message data", JSON.parse(event.data));
    });
  }, []);
}

export default useBookConnection;
