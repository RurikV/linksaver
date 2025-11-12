import { createGlobalStyle } from "styled-components";
import React from "react";

import OptionsPage from "./containers/options";
import ContentScript from "./containers/link-manager";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-weight: 400;
    font-style: normal;
  }
`;

// Container can be "content" or "options"
const App = ({ container }) => {
  return (
    <>
      <GlobalStyle />
      {container === "content" ? <ContentScript /> : <OptionsPage />}
    </>
  );
};

export default App;
