import React from "react";

import classes from "./OrdersTable.module.css";

// @TODO: Review type
type Order = {
  total: number;
  amount: number;
  price: number;
};

export default function OrdersTable({
  type,
  orders,
}: {
  type: "asks" | "bids";
  orders: Order[];
}) {
  const numberFormatter = new Intl.NumberFormat();
  const priceFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
  });

  return (
    <table className={`${classes.table} ${classes[type]}`}>
      <thead className={classes.tableHeader}>
        <tr>
          <th>Total</th>
          <th>Size</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(({ total, amount, price }) => (
          <tr key={price}>
            <td>{numberFormatter.format(total)}</td>
            <td>{numberFormatter.format(amount)}</td>
            <td className={classes.priceCell}>
              {priceFormatter.format(price)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
