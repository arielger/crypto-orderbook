import { useEffect, useState } from "react";

type OrdersObj = {
  [price: number]: number;
};

type OrdersState = {
  asks: OrdersObj;
  bids: OrdersObj;
};

type Order = [number, number]; // [price, size]

type BookMessage = {
  feed: string;
  asks: Order[];
  bids: Order[];
  event:
    | "subscribed"
    | "subscribed_failed"
    | "unsubscribed"
    | "unsubscribed_failed";
};

function processInitialOrders(orders: Order[]) {
  return Object.fromEntries(orders);
}

export function processOrdersDeltas(
  originalList: OrdersObj,
  deltas: Order[]
): OrdersObj {
  // @TODO: Error handling / handle bad structure
  // @TODO: Review performance
  const newList = { ...originalList };

  deltas.forEach(([price, size]) => {
    if (size === 0) {
      delete newList[price];
    } else if (size > 0) {
      newList[price] = size;
    }
  });

  return newList;
}

export function handleDeltas(
  originalBook: OrdersState,
  asks: Order[],
  bids: Order[]
): OrdersState {
  return {
    asks: processOrdersDeltas(originalBook.asks, asks),
    bids: processOrdersDeltas(originalBook.bids, bids),
  };
}

function useBookConnection() {
  let socket: WebSocket;

  const [bookData, setBookData] = useState<OrdersState>({
    asks: {},
    bids: {},
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
      const messageData: BookMessage = JSON.parse(event.data);

      console.log("messageData", messageData);

      if (messageData.event === "subscribed") {
        console.log("Subscribed succesfully");
      } else if (messageData.event) {
        // @TODO: Handle all possible events
      } else if (messageData.feed === "book_ui_1_snapshot") {
        // Initialize book data with snapshot
        setBookData({
          asks: processInitialOrders(messageData.asks),
          bids: processInitialOrders(messageData.bids),
        });
      } else if (messageData.feed === "book_ui_1") {
        setBookData((originalBookData) =>
          handleDeltas(originalBookData, messageData.asks, messageData.bids)
        );
      }
    });
  }, []);

  return {
    asks: Object.entries(bookData.asks),
    bids: Object.entries(bookData.bids),
  };
}

export default useBookConnection;
