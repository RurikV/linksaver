import { Outlet } from "react-router-dom";

import { useAuth } from "../hooks/use-auth";

const Protected = () => {
  useAuth({ onUnauth: "/login" });

  return <Outlet />;
};

export default Protected;
