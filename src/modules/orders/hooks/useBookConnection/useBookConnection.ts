import { useEffect, useState, useMemo } from "react";

import { Markets, ConnectionStatusEnum, Order } from "../../types";

import { OrdersState, BookMessage } from "./types";

import {
  processInitialOrders,
  handleDeltas,
  processOrdersOutput,
} from "./utils";

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
}): {
  connectionStatus: ConnectionStatusEnum;
  asks: Order[];
  bids: Order[];
  killFeed: () => void;
} {
  const socket = useMemo(
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

  function handleNewMessage(event: MessageEvent) {
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
