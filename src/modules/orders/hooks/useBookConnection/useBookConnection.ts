import { useEffect, useState, useMemo, useCallback } from "react";

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
  const [connectionData, setConnectionData] = useState<{
    status: ConnectionStatusEnum;
    market: Markets;
  }>({
    status: ConnectionStatusEnum.INITIAL,
    market: selectedMarket,
  });
  const [bookData, setBookData] = useState<OrdersState>(initialBookData);

  const handleInitConnection = useCallback(() => {
    setConnectionData({
      status: ConnectionStatusEnum.CONNECTING,
      market: selectedMarket,
    });
    socket.send(
      JSON.stringify({
        event: "subscribe",
        feed: "book_ui_1",
        product_ids: [selectedMarket],
      })
    );
  }, [selectedMarket, socket]);

  const handleNewMessage = useCallback((event: MessageEvent) => {
    const messageData: BookMessage = JSON.parse(event.data);

    if (messageData.event === "subscribed") {
      setConnectionData((connection) => ({
        ...connection,
        status: ConnectionStatusEnum.OPEN,
      }));
    } else if (messageData.event === "subscribed_failed") {
      setConnectionData((connection) => ({
        ...connection,
        status: ConnectionStatusEnum.ERROR,
      }));
    } else if (messageData.event === "unsubscribed") {
      setBookData(initialBookData);
      setConnectionData((connection) => {
        if (connection.status === ConnectionStatusEnum.ERROR) return connection;
        return {
          ...connection,
          status: ConnectionStatusEnum.INITIAL,
        };
      });
    } else if (messageData.event === "unsubscribed_failed") {
      // @TODO: Handle unsubscribed_failed
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
  }, []);

  const disconnectFromSocket = useCallback(() => {
    socket.send(
      JSON.stringify({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [selectedMarket],
      })
    );
  }, [selectedMarket, socket]);

  const killFeed = useCallback(() => {
    if (connectionData.status === ConnectionStatusEnum.ERROR) {
      handleInitConnection();
    } else {
      disconnectFromSocket();
      setConnectionData((connectionData) => ({
        ...connectionData,
        status: ConnectionStatusEnum.ERROR,
      }));
    }
  }, [connectionData.status, disconnectFromSocket, handleInitConnection]);

  // Handle connection and disconnection from socket
  useEffect(() => {
    socket.addEventListener("open", handleInitConnection);
    socket.addEventListener("message", handleNewMessage);

    return () => {
      disconnectFromSocket();
    };
  }, [
    disconnectFromSocket,
    handleInitConnection,
    handleNewMessage,
    selectedMarket,
    socket,
  ]);

  // Connect to the other market when unsubscription for first feed finishes (check handleNewMessage)
  useEffect(() => {
    if (
      connectionData.status === ConnectionStatusEnum.INITIAL &&
      connectionData.market !== selectedMarket
    ) {
      handleInitConnection();
    }
  }, [connectionData, handleInitConnection, selectedMarket]);

  return {
    connectionStatus: connectionData.status,
    asks: processOrdersOutput(bookData.asks, tickSize),
    bids: processOrdersOutput(bookData.bids, tickSize),
    killFeed,
  };
}

export default useBookConnection;
