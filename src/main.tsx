
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { registerServiceWorker } from "./utils/registerSW.ts";

  // Register Service Worker for PWA
  registerServiceWorker();

  createRoot(document.getElementById("root")!).render(<App />);
  