import React from "react";

// @TODO: Review type
type Order = {
  total: number;
  amount: number;
  price: number;
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Total</th>
          <th>Size</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(({ total, amount, price }) => (
          <tr key={price}>
            <td>{total}</td>
            <td>{amount}</td>
            <td>{price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
