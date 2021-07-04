import { Markets } from "./types";

export const tickSizesByMarket = {
  [Markets.PI_XBTUSD]: [0.5, 1, 2.5],
  [Markets.PI_ETHUSD]: [0.05, 0.1, 0.25],
};

export const defaultMarket = Markets.PI_XBTUSD;

export const API_URL = "wss://www.cryptofacilities.com/ws/v1";
