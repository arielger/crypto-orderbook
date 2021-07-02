import { roundDownToInterval } from "../../../../utils";

import { Order } from "../../types";

import { OrdersObj, OrdersState } from "./types";

export function processInitialOrders(orders: Order[]): OrdersObj {
  return Object.fromEntries(orders);
}

function processOrdersDeltas(
  originalList: OrdersObj,
  deltas: Order[]
): OrdersObj {
  // @TODO: Error handling / handle bad structure
  // @TODO: Review performance
  const newList = { ...originalList };

  deltas.forEach(([price, size]) => {
    if (size === 0) {
      delete newList[price];
    } else if (size > 0) {
      newList[price] = size;
    }
  });

  return newList;
}

export function handleDeltas(
  originalBook: OrdersState,
  asks: Order[],
  bids: Order[]
): OrdersState {
  return {
    asks: processOrdersDeltas(originalBook.asks, asks),
    bids: processOrdersDeltas(originalBook.bids, bids),
  };
}

export function processOrdersOutput(
  orders: OrdersObj,
  tickSize: number
): Order[] {
  const ordersByTickSize: OrdersObj = {};

  for (const [price, size] of Object.entries(orders)) {
    // Multiply indexes by 100 to use integer indices in the object instead of decimals
    // and preserve ordering when traversing
    // https://2ality.com/2015/10/property-traversal-order-es6.html
    const roundedPrice = roundDownToInterval(Number(price), tickSize) * 100;
    ordersByTickSize[roundedPrice] = ordersByTickSize[roundedPrice]
      ? ordersByTickSize[roundedPrice] + size
      : size;
  }

  return Object.entries(ordersByTickSize).map(([price, size]) => [
    // Divide by 100 to return original price number
    Number(price) / 100,
    size,
  ]);
}
