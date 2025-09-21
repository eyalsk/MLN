import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      ".localhost",
      ".ngrok-free.app",
      "unprofessorially-positivistic-dan.ngrok-free.app",
    ],
  },
});
