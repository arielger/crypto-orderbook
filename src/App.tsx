import React from "react";
import "./App.css";

import OrderBook from "./modules/orders/components/OrderBook";

function App(): JSX.Element {
  return (
    <div className="App">
      <OrderBook />
    </div>
  );
}

export default App;
