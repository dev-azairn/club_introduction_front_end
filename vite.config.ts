import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      // This tells Vite: "Whenever a library asks for 'dotenv', give it nothing."
      dotenv: 'vite-aliases/dotenv', 
    },
  },
  // If the above doesn't work, try defining it as an empty object directly:
  define: {
    'process.env': {} 
  }
});
