import { Order } from "../../types";

export type OrdersObj = Record<number, number>;

export type OrdersState = {
  asks: OrdersObj;
  bids: OrdersObj;
};

export type BookMessage = {
  feed: string;
  asks: Order[];
  bids: Order[];
  event:
    | "subscribed"
    | "subscribed_failed"
    | "unsubscribed"
    | "unsubscribed_failed";
};
