import { useEffect, useState, useMemo } from "react";
import { roundToNearest } from "../utils";

import { Markets, ConnectionStatusEnum } from "../types";

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

function processOrdersDeltas(
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

export function processOrdersOutput(
  orders: OrdersObj,
  tickSize: number
): Order[] {
  const ordersByTickSize: OrdersObj = {};

  for (const [price, size] of Object.entries(orders)) {
    // Multiply indexes by 100 to use integer indices in the object instead of decimals
    // and preserve ordering when traversing
    // https://2ality.com/2015/10/property-traversal-order-es6.html
    const roundedPrice = roundToNearest(Number(price), tickSize) * 100;
    ordersByTickSize[roundedPrice] = ordersByTickSize[roundedPrice]
      ? ordersByTickSize[roundedPrice] + size
      : size;
  }

  return Object.entries(ordersByTickSize).map(([price, size]) => [
    Number(price) / 100,
    size,
  ]);
}

const initialBookData = {
  asks: {},
  bids: {},
};

function useBookConnection({
  tickSize = 0.5,
  selectedMarket,
}: {
  tickSize: number;
  selectedMarket: Markets;
}) {
  let socket = useMemo(
    () => new WebSocket("wss://www.cryptofacilities.com/ws/v1"),
    []
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatusEnum>(ConnectionStatusEnum.INITIAL);
  const [bookData, setBookData] = useState<OrdersState>(initialBookData);

  function handleInitConnection() {
    setConnectionStatus(ConnectionStatusEnum.CONNECTING);
    socket.send(
      JSON.stringify({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [selectedMarket],
      })
    );
  }

  function handleNewMessage(event) {
    const messageData: BookMessage = JSON.parse(event.data);

    if (messageData.event === "subscribed") {
      setConnectionStatus(ConnectionStatusEnum.OPEN);
    } else if (messageData.event === "unsubscribed") {
      setBookData(initialBookData);
      setConnectionStatus(ConnectionStatusEnum.INITIAL);
      handleInitConnection();
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
  }

  useEffect(() => {
    socket.addEventListener("open", handleInitConnection);
    socket.addEventListener("message", handleNewMessage);

    return () => {
      socket.send(
        JSON.stringify({
          event: "unsubscribe",
          feed: "book_ui_1",
          product_ids: [selectedMarket],
        })
      );

      socket.removeEventListener("open", handleInitConnection);
      socket.removeEventListener("message", handleNewMessage);
    };
  }, [selectedMarket]);

  function killFeed() {
    // socket.send("ERROR");
  }

  return {
    connectionStatus,
    asks: processOrdersOutput(bookData.asks, tickSize),
    bids: processOrdersOutput(bookData.bids, tickSize),
    killFeed,
  };
}

export default useBookConnection;
