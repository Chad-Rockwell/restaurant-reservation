import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <React.Fragment>
      <div className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="navbar-nav mx-auto">
          <Menu />
        </div>
      </div>
      <Routes />
    </React.Fragment>
  );
}

export default Layout;
