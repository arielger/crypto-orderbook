import React, { useState } from "react";

import useBookConnection from "../hooks/useBookConnection";

import OrdersTable from "./OrdersTable";

import classes from "./OrderBook.module.css";

export default function OrderBook() {
  const [ticketSize, setTicketSize] = useState(0.5);
  const { bids, asks } = useBookConnection({ ticketSize });

  return (
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
        <OrdersTable type="bids" orders={bids} />
        <OrdersTable type="asks" orders={asks} />
      </div>
    </div>
  );
}
