import React from "react";
import { createRoot } from "react-dom/client";
import Ref3rProfile from "./Ref3rProfile.jsx";
import Admin from "./Admin.jsx";

const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <Admin /> : <Ref3rProfile />}
  </React.StrictMode>
);
