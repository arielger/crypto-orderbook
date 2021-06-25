import { useEffect, useState } from "react";

type OrderInput = [number, number];

type Order = {
  price: number;
  amount: number;
  total: number;
};

function processOrders(orders: OrderInput[]): Order[] {
  let total = 0;

  return orders.map(([price, amount]) => {
    total = total + amount;

    return {
      price,
      amount,
      total: total,
    };
  });
}

// @TODO: Complete hook
function useBookConnection() {
  let socket: WebSocket;

  const [bookData, setBookData] = useState<{
    asks: Order[];
    bids: Order[];
  }>({
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
      const messageData = JSON.parse(event.data);

      // Initialize book data with snapshot
      if (messageData.feed === "book_ui_1_snapshot") {
        setBookData({
          asks: processOrders(messageData.asks),
          bids: processOrders(messageData.bids),
        });
      }
    });
  }, []);

  return { bookData };
}

export default useBookConnection;
