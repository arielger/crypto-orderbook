import "@testing-library/jest-dom/extend-expect";
import React from "react";
import WS from "jest-websocket-mock";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderBook from "./OrderBook";

import { defaultMarket } from "../../config";
import { Markets } from "../../types";

import {
  snapshotMessage,
  subscribedMessage,
  subscribeMessage,
  unsubscribeMessage,
  snapshotByMarket,
} from "../../mocks/book";

let ws: WS;
beforeEach(() => {
  ws = new WS("wss://www.cryptofacilities.com/ws/v1");
});
afterEach(() => {
  WS.clean();
});

const setupWSInitialData = async (market: Markets = defaultMarket) => {
  await ws.connected;

  // Should send connection message
  await expect(ws).toReceiveMessage(JSON.stringify(subscribeMessage(market)));

  ws.send(JSON.stringify(subscribedMessage(market)));
  ws.send(JSON.stringify(snapshotMessage(market)));
};

describe("OrderBook", () => {
  test("renders loading screen", () => {
    render(<OrderBook />);
    expect(screen.getByText("Loading orderbook data"));
  });

  test("should render first snapshot of data", async () => {
    render(<OrderBook />);

    await setupWSInitialData();

    const { bids, asks } = snapshotByMarket[defaultMarket];

    const bidsOrders = screen.getAllByTestId(/order-row-bids/i);
    expect(bidsOrders).toHaveLength(bids.length);

    expect(within(bidsOrders[0]).getByTestId("price")).toHaveTextContent(
      "34,779.00"
    );
    expect(within(bidsOrders[0]).getByTestId("amount")).toHaveTextContent(
      "63,210"
    );

    const asksOrders = screen.getAllByTestId(/order-row-asks/i);
    expect(asksOrders).toHaveLength(asks.length);
    expect(within(asksOrders[0]).getByTestId("price")).toHaveTextContent(
      "34,817.00"
    );
    expect(within(asksOrders[0]).getByTestId("amount")).toHaveTextContent(
      "1,000"
    );
  });

  test("should handle new events (deltas)", async () => {
    render(<OrderBook />);

    const { asks } = snapshotByMarket[defaultMarket];

    await setupWSInitialData();

    ws.send(
      JSON.stringify({
        feed: "book_ui_1",
        product_id: "PI_XBTUSD",
        bids: [],
        asks: [
          // Remove one price level
          [34817.0, 0],
          // Modify one size
          [34821.5, 5000],
        ],
      })
    );

    const asksOrders = screen.getAllByTestId(/order-row-asks/i);

    // Should remove the first ask
    expect(asksOrders).toHaveLength(asks.length - 1);

    expect(within(asksOrders[0]).getByTestId("price")).toHaveTextContent(
      "34,821.50"
    );
    expect(within(asksOrders[0]).getByTestId("amount")).toHaveTextContent(
      "5,000"
    );
  });

  test("should change market when clicking toggle market", async () => {
    render(<OrderBook />);

    await setupWSInitialData();

    userEvent.click(screen.getByText(/Toggle feed/i));

    // Should send unsubscribe message for previous market
    await expect(ws).toReceiveMessage(
      JSON.stringify({
        event: "unsubscribe",
        feed: "book_ui_1",
        product_ids: ["PI_XBTUSD"],
      })
    );

    // Mock unsubscription message from server
    ws.send(JSON.stringify(unsubscribeMessage(Markets.PI_ETHUSD)));

    expect(screen.getByText("Loading orderbook data"));

    // Should toggle the market
    expect(screen.getByTestId("orderbook-title")).toHaveTextContent(
      "PI_ETHUSD"
    );

    // Should send subscribe message for new market
    await setupWSInitialData(Markets.PI_ETHUSD);
  });

  test("should handle different tick groups", async () => {
    render(<OrderBook />);

    await setupWSInitialData();

    userEvent.selectOptions(screen.getByTestId("group-select"), "2.5");

    const asksOrders = screen.getAllByTestId(/order-row-asks/i);

    expect(asksOrders).toHaveLength(12);
  });

  // test("should handle unexpected messages from socket", async () => {
  //   render(<OrderBook />);

  //   await setupWSInitialData();

  //   ws.error();
  // });
});

export {};
