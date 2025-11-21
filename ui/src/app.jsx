import { createGlobalStyle } from "styled-components";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginRoute from "./routes/login";
import RegisterRoute from "./routes/register";
import RootRoute from "./routes/root";
import UnverifiedRoute from "./routes/unverified";
import VerifyRoute from "./routes/verify";
import Protected from "./routes/protected";
import CmsRoute from "./routes/cms";
import ContentHubEnhanced from "./routes/content-hub-enhanced";
import ContentHub from "./routes/content-hub";
import PatternsDemonstration from "./routes/patterns-demonstration";
import CmsDashboard from "./routes/cms-dashboard";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Open Sans", sans-serif;
    font-weight: 400;
    font-style: normal;
  }
`;

const App = () => {
  return (
    <>
      <GlobalStyle />
      <ToastContainer autoClose={1500} />
      <Routes>
        <Route path="/cms/:slug" element={<CmsRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/unverified" element={<UnverifiedRoute />} />
        <Route path="/verify/:token" element={<VerifyRoute />} />
        <Route element={<Protected />}>
          <Route path="/" element={<RootRoute />} />
          <Route path="/content-hub" element={<ContentHubEnhanced />} />
          <Route path="/content-hub-original" element={<ContentHub />} />
          <Route path="/patterns-demo" element={<PatternsDemonstration />} />
          <Route path="/cms-dashboard" element={<CmsDashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
