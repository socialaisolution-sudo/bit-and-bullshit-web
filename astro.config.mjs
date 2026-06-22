import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://bit-and-bullshit.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
