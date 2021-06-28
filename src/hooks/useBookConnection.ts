import { useEffect, useState } from "react";

type Order = [number, number]; // [price, size]

type OrdersState = {
  asks: Order[];
  bids: Order[];
};

function useBookConnection() {
  let socket: WebSocket;

  const [bookData, setBookData] = useState<OrdersState>({
    asks: [],
    bids: [],
  });

  useEffect(() => {
    socket = new WebSocket("wss://www.cryptofacilities.com/ws/v1");

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
      const messageData: {
        feed: string;
        asks: Order[];
        bids: Order[];
      } = JSON.parse(event.data);

      console.log("messageData", messageData);

      // Initialize book data with snapshot
      if (messageData.feed === "book_ui_1_snapshot") {
        setBookData({
          asks: messageData.asks,
          bids: messageData.bids,
        });
      }

      // @TODO: Handle deltas to update the orderbook
      // if (messageData.feed === "book_ui_1") {
      //   setBookData(handleDeltas(bookData, messageData.asks, messageData.bids));
      // }
    });
  }, []);

  return { bookData };
}

export default useBookConnection;
