import React, { useState } from "react";
import { BsArrowUpDown } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { IoWarningOutline } from "react-icons/io5";
import { BiErrorCircle } from "react-icons/bi";

import useBookConnection from "../../hooks/useBookConnection";

import Button from "../../../../ui/Button";

import OrdersTable from "../OrdersTable";

import classes from "./OrderBook.module.css";

import { Markets, ConnectionStatusEnum } from "../../types";
import { tickSizesByMarket, defaultMarket } from "../../config";

export default function OrderBook(): JSX.Element {
  const [selectedMarket, setSelectedMarket] = useState<Markets>(defaultMarket);
  const tickSizes = tickSizesByMarket[selectedMarket];
  const [tickSize, setTickSize] = useState(tickSizes[0]);
  const { connectionStatus, bids, asks, killFeed } = useBookConnection({
    tickSize,
    selectedMarket,
  });

  const handleToggleFeed = () => {
    setSelectedMarket((currentSelectedMarket) => {
      const newMarket =
        currentSelectedMarket === Markets.PI_XBTUSD
          ? Markets.PI_ETHUSD
          : Markets.PI_XBTUSD;

      setTickSize(tickSizesByMarket[newMarket][0]);

      return newMarket;
    });
  };

  const isError = connectionStatus === ConnectionStatusEnum.ERROR;
  const isReconnecting = connectionStatus === ConnectionStatusEnum.RECONNECTING;
  const isLoading = [
    ConnectionStatusEnum.INITIAL,
    ConnectionStatusEnum.SUBSCRIBING,
    ConnectionStatusEnum.UNSUBSCRIBING,
  ].includes(connectionStatus);
  const isSubscribed = connectionStatus === ConnectionStatusEnum.SUBSCRIBED;

  return (
    <div className={classes.container}>
      <div className={classes.backgroundContainer}>
        <div className={classes.header}>
          <h1 data-testid="orderbook-title" className={classes.title}>
            Order Book ({selectedMarket})
          </h1>
          <select
            data-testid="group-select"
            value={tickSize}
            onChange={(e) => setTickSize(Number(e.target.value))}
            name="group"
            className={classes.groupSelect}
          >
            {tickSizes.map((tickSize) => (
              <option key={tickSize} value={tickSize}>
                Group {tickSize}
              </option>
            ))}
          </select>
        </div>
        <div className={classes.tablesContainer}>
          {isLoading && (
            <div className={`${classes.overlay} ${classes.loading}`}>
              <CgSpinner />
              <span>Loading orderbook data</span>
            </div>
          )}
          {isReconnecting && (
            <div className={`${classes.overlay} ${classes.loading}`}>
              <CgSpinner />
              <span>
                There was an error with the connection. Trying to reconnect.
              </span>
            </div>
          )}
          {isError && (
            <div className={classes.overlay}>
              <BiErrorCircle />
              <span>There was an error getting the orderbook data</span>
            </div>
          )}
          <OrdersTable type="bids" orders={bids} />
          <OrdersTable type="asks" orders={asks} />
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <Button
          disabled={!isSubscribed}
          icon={<BsArrowUpDown />}
          text="Toggle Feed"
          onClick={handleToggleFeed}
        />
        <Button
          disabled={!isSubscribed}
          type="danger"
          icon={<IoWarningOutline />}
          text={isError ? "Restart feed" : "Kill Feed"}
          onClick={killFeed}
        />
      </div>
    </div>
  );
}
