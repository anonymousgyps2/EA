import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver loop errors (harmless warning from Radix UI)
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop completed with undelivered notifications|ResizeObserver loop limit exceeded)]/;
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && resizeObserverLoopErrRe.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

// Suppress ResizeObserver errors in window
window.addEventListener('error', (e) => {
  if (e.message.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
