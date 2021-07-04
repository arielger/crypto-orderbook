export type Order = [number, number]; // [price, size]

export enum Markets {
  PI_XBTUSD = "PI_XBTUSD",
  PI_ETHUSD = "PI_ETHUSD",
}

export enum ConnectionStatusEnum {
  INITIAL = "INITIAL",
  SUBSCRIBING = "SUBSCRIBING",
  SUBSCRIBED = "SUBSCRIBED",
  UNSUBSCRIBING = "UNSUBSCRIBING",
  ERROR = "ERROR",
  RECONNECTING = "RECONNECTING",
}
