import React from "react";

import useBookConnection from "../hooks/useBookConnection";

import OrdersTable from "./OrdersTable";

import classes from "./OrderBook.module.css";

export default function OrderBook() {
  const { bookData } = useBookConnection();

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.title}>Order Book</h1>
        <select name="group" id="group" className={classes.groupSelect}>
          <option value="0.5">Group 0.5</option>
          <option value="1">Group 1</option>
          <option value="2.5">Group 2.5</option>
        </select>
      </div>
      <div className={classes.tablesContainer}>
        <OrdersTable type="bids" orders={bookData.bids} />
        <OrdersTable type="asks" orders={bookData.asks} />
      </div>
    </div>
  );
}
