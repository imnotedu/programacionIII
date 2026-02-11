import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeApp } from "./services/initApp";

// Inicializar la aplicación (base de datos y superadmin)
initializeApp().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('Error fatal al inicializar la aplicación:', error);
});
