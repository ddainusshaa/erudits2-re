import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";

let gitTag = "unknown";
try {
  gitTag = execSync("git describe --tags --abbrev=0").toString().trim();
} catch (e) {
  console.warn("No Git tag found");
}

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_VERSION__: JSON.stringify(gitTag),
  },
});
