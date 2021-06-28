import React from "react";

import useBookConnection from "../hooks/useBookConnection";

import OrdersTable from "./OrdersTable";

import classes from "./OrderBook.module.css";

export default function OrderBook() {
  // const { bookData } = useBookConnection();

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
      {/* @TODO: Replace with real data */}
      <div className={classes.tablesContainer}>
        <OrdersTable
          type="bids"
          orders={[
            {
              total: 2300,
              amount: 2300,
              price: 47341,
            },
            {
              total: 2800,
              amount: 500,
              price: 47340.5,
            },
            {
              total: 3300,
              amount: 500,
              price: 47339.5,
            },
          ]}
        />
        <OrdersTable
          type="asks"
          orders={[
            {
              total: 2300,
              amount: 2300,
              price: 47363.5,
            },
            {
              total: 7036,
              amount: 4736,
              price: 47364,
            },
            {
              total: 13426,
              amount: 6390,
              price: 47364.5,
            },
          ]}
        />
      </div>
    </div>
  );
}
