import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react", "react-dom/client", "axios", "lucide-react"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
});
