import { initializePaddle } from "@paddle/paddle-js";

let paddleInitialization;
const eventListeners = new Set();

export const initializePaddleClient = (options) => {
  if (!paddleInitialization) {
    paddleInitialization = initializePaddle({
      ...options,
      eventCallback: (event) => {
        for (const listener of eventListeners) listener(event);
      },
    }).catch((error) => {
      paddleInitialization = null;
      throw error;
    });
  }
  return paddleInitialization;
};

export const subscribeToPaddleEvents = (listener) => {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
};
