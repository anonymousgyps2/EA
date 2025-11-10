import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver loop errors (harmless warning from Radix UI Accordion)
// This is a known non-critical issue with ResizeObserver and doesn't affect functionality
const suppressResizeObserverErrors = () => {
  const resizeObserverErr = /ResizeObserver loop/;
  
  // Suppress console errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && resizeObserverErr.test(args[0])) {
      return; // Suppress ResizeObserver errors
    }
    originalConsoleError.apply(console, args);
  };

  // Suppress window errors
  window.addEventListener('error', (e) => {
    if (resizeObserverErr.test(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  });
};

suppressResizeObserverErrors();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
