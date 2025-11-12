import React from "react";
import { ThemeProvider } from "styled-components";
import { createRoot } from "react-dom/client";

import { theme } from "./constants/theme";

import App from "./app";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App container="options" />
    </ThemeProvider>
  </React.StrictMode>
);
