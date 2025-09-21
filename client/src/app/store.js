import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "../features/categories/categoriesSlice";
import productsReducer from "../features/products/productsSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/order/orderSlice";

const defaultBackendEndpoint = "http://localhost:3000"; // Default for development

let backendEndpoint = defaultBackendEndpoint;

// Fetch the backend endpoint from config.json
fetch("/config.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    return response.json();
  })
  .then((config) => {
    backendEndpoint = config.backend_endpoint || defaultBackendEndpoint;
    console.log("Backend Endpoint:", backendEndpoint);
  })
  .catch((error) => {
    console.error("Error loading config.json:", error);
  });

export { backendEndpoint };

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    products: productsReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});
