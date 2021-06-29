import React, { useState } from "react";
import { BsArrowUpDown } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";

import useBookConnection from "../hooks/useBookConnection";

import Button from "../ui/Button";

import OrdersTable from "./OrdersTable";

import classes from "./OrderBook.module.css";

import { Markets, ConnectionStatusEnum } from "../types";

export default function OrderBook() {
  const [ticketSize, setTicketSize] = useState(0.5);
  const [selectedMarket, setSelectedMarket] = useState<Markets>(
    Markets.PI_XBTUSD
  );
  const { connectionStatus, bids, asks } = useBookConnection({
    ticketSize,
    selectedMarket,
  });

  const handleToggleFeed = () => {
    setSelectedMarket((currentSelectedMarket) =>
      currentSelectedMarket === Markets.PI_XBTUSD
        ? Markets.PI_ETHUSD
        : Markets.PI_XBTUSD
    );
  };

  const isLoadingData = [
    ConnectionStatusEnum.INITIAL,
    ConnectionStatusEnum.CONNECTING,
  ].includes(connectionStatus);

  return (
    <div>
      <div className={classes.container}>
        <div className={classes.header}>
          <h1 className={classes.title}>Order Book</h1>
          <select
            value={ticketSize}
            onChange={(e) => setTicketSize(Number(e.target.value))}
            name="group"
            id="group"
            className={classes.groupSelect}
          >
            <option value={0.5}>Group 0.5</option>
            <option value={1}>Group 1</option>
            <option value={2.5}>Group 2.5</option>
          </select>
        </div>
        <div className={classes.tablesContainer}>
          {isLoadingData && (
            <div className={classes.loading}>
              <CgSpinner />
              <span>Loading orderbook data</span>
            </div>
          )}
          <OrdersTable type="bids" orders={bids} />
          <OrdersTable type="asks" orders={asks} />
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <Button
          disabled={isLoadingData}
          icon={<BsArrowUpDown />}
          text="Toggle Feed"
          onClick={handleToggleFeed}
        />
        <Button icon={<BsArrowUpDown />} text="Kill Feed" />
      </div>
    </div>
  );
}
