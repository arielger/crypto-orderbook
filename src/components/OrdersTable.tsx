import React from "react";

import classes from "./OrdersTable.module.css";

type Order = [string, number]; // [amount, price]

function addTotalToOrders(orders: Order[]) {
  let currentTotal = 0;

  const ordersWithTotal = orders.map(([price, amount]) => {
    currentTotal = currentTotal + amount;
    return {
      price,
      amount,
      total: currentTotal,
    };
  });

  return {
    ordersWithTotal,
    tableTotal: currentTotal,
  };
}

export default function OrdersTable({
  type,
  orders,
}: {
  type: "bids" | "asks";
  orders: Order[];
}) {
  const numberFormatter = new Intl.NumberFormat();
  const priceFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
  });
  const isBidsTable = type === "bids";

  const { ordersWithTotal, tableTotal } = addTotalToOrders(orders);

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
        {ordersWithTotal.map(({ total, amount, price }) => {
          const totalPercentage = `${(total / tableTotal) * 100}%`;

          return (
            <tr
              key={price}
              style={{
                background: `
                  linear-gradient(
                    ${isBidsTable ? "to left" : "to right"},
                    ${isBidsTable ? "#3e212c" : "#103839"} ${totalPercentage},
                    transparent ${totalPercentage}
                  )`,
              }}
            >
              <td>{numberFormatter.format(total)}</td>
              <td>{numberFormatter.format(amount)}</td>
              <td className={classes.priceCell}>
                {priceFormatter.format(Number(price))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
