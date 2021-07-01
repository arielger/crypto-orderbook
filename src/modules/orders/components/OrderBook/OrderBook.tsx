import React, { useState } from "react";
import { BsArrowUpDown } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { IoWarningOutline } from "react-icons/io5";

import useBookConnection from "../../hooks/useBookConnection";

import Button from "../../../../ui/Button";

import OrdersTable from "../OrdersTable";

import classes from "./OrderBook.module.css";

import { Markets, ConnectionStatusEnum } from "../../types";

const tickSizesByMarket = {
  [Markets.PI_XBTUSD]: [0.5, 1, 2.5],
  [Markets.PI_ETHUSD]: [0.05, 0.1, 0.25],
};

export default function OrderBook(): JSX.Element {
  const [selectedMarket, setSelectedMarket] = useState<Markets>(
    Markets.PI_XBTUSD
  );
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

  const isLoadingData = [
    ConnectionStatusEnum.INITIAL,
    ConnectionStatusEnum.CONNECTING,
  ].includes(connectionStatus);

  return (
    <div className={classes.container}>
      <div className={classes.backgroundContainer}>
        <div className={classes.header}>
          <h1 className={classes.title}>Order Book ({selectedMarket})</h1>
          <select
            value={tickSize}
            onChange={(e) => setTickSize(Number(e.target.value))}
            name="group"
            id="group"
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
        <Button
          type="danger"
          icon={<IoWarningOutline />}
          text="Kill Feed"
          onClick={killFeed}
        />
      </div>
    </div>
  );
}
