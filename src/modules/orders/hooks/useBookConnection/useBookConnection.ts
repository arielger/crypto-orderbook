import { useEffect, useState, useMemo, useCallback } from "react";

import { Markets, ConnectionStatusEnum, Order } from "../../types";

import { OrdersState, BookMessage } from "./types";

import { API_URL } from "../../config";

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
  // Prevent evaluation new websocket in each render using useMemo
  const socketMemo = useMemo(() => new WebSocket(API_URL), []);
  const [socket, setSocket] = useState(socketMemo);
  const [connectionData, setConnectionData] = useState<{
    status: ConnectionStatusEnum;
    market?: Markets;
  }>({
    status: ConnectionStatusEnum.INITIAL,
    market: selectedMarket,
  });
  const [bookData, setBookData] = useState<OrdersState>(initialBookData);

  const setConnectionStatus = useCallback((status: ConnectionStatusEnum) => {
    setConnectionData((connectionData) => ({
      ...connectionData,
      status,
    }));
  }, []);

  const subscribeToMarket = useCallback(() => {
    setConnectionData({
      status: ConnectionStatusEnum.SUBSCRIBING,
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

  const unsubscribeFromMarket = useCallback(() => {
    setConnectionData({
      status: ConnectionStatusEnum.UNSUBSCRIBING,
    });
    socket.send(
      JSON.stringify({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: [selectedMarket],
      })
    );
  }, [selectedMarket, socket]);

  const handleNewMessage = useCallback(
    (event: MessageEvent) => {
      const messageData: BookMessage = JSON.parse(event.data);

      if (messageData.event) {
        // eslint-disable-next-line no-console
        console.log(messageData);
      }

      if (messageData.event === "subscribed") {
        setConnectionStatus(ConnectionStatusEnum.SUBSCRIBED);
      } else if (messageData.event === "unsubscribed") {
        setBookData(initialBookData);
        setConnectionStatus(ConnectionStatusEnum.INITIAL);
      } else if (
        ["subscribed_failed", "unsubscribed_failed"].includes(messageData.event)
      ) {
        // @TODO: Improve handling of connection error events
        // Try to subscribe or unsubscribe again to the same market
        setConnectionStatus(ConnectionStatusEnum.ERROR);
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
    },
    [setConnectionStatus]
  );

  const handleDisconnection = useCallback(() => {
    setConnectionStatus(ConnectionStatusEnum.RECONNECTING);
    setTimeout(() => {
      setSocket(new WebSocket(API_URL));
      setConnectionStatus(ConnectionStatusEnum.INITIAL);
    }, 3000);
  }, [setConnectionStatus]);

  const killFeed = useCallback(() => {
    socket.close();
  }, [socket]);

  const attachEventListeners = useCallback(() => {
    socket.addEventListener("open", subscribeToMarket);
    socket.addEventListener("message", handleNewMessage);
    socket.addEventListener("error", handleDisconnection);
    socket.addEventListener("close", handleDisconnection);
  }, [handleDisconnection, handleNewMessage, socket, subscribeToMarket]);

  useEffect(() => {
    attachEventListeners();
  }, [attachEventListeners]);

  // Connect to the other market when unsubscription for first feed finishes (check handleNewMessage)
  useEffect(() => {
    if (
      connectionData.status === ConnectionStatusEnum.INITIAL &&
      connectionData.market !== selectedMarket
    ) {
      subscribeToMarket();
    }
  }, [
    connectionData.market,
    connectionData.status,
    subscribeToMarket,
    selectedMarket,
  ]);

  useEffect(() => {
    return () => {
      unsubscribeFromMarket();
    };
  }, [selectedMarket, unsubscribeFromMarket]);

  return {
    connectionStatus: connectionData.status,
    asks: processOrdersOutput(bookData.asks, tickSize),
    bids: processOrdersOutput(bookData.bids, tickSize),
    killFeed,
  };
}

export default useBookConnection;
