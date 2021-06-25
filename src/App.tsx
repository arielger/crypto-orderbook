import React from "react";
import "./App.css";

import useBookConnection from "./hooks/useBookConnection";

function App() {
  const { bookData } = useBookConnection();

  return (
    <div className="App">
      <h1>Buy side / bids</h1>
      <table>
        <tr>
          <th>Total</th>
          <th>Size</th>
          <th>Price</th>
        </tr>
        {bookData.bids.map(({ total, amount, price }) => (
          <tr>
            <td>{total}</td>
            <td>{amount}</td>
            <td>{price}</td>
          </tr>
        ))}
      </table>
      <h1>Sell side / asks</h1>
      <table>
        <tr>
          <th>Total</th>
          <th>Size</th>
          <th>Price</th>
        </tr>
        {bookData.asks.map(({ total, amount, price }) => (
          <tr>
            <td>{total}</td>
            <td>{amount}</td>
            <td>{price}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default App;
