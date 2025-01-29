import React from "react";
import { FaSyncAlt, FaDesktop } from "react-icons/fa";
import "./Header.css";

const Header = () => {
  // Function to handle refresh and navigate to the main page
  const handleRefresh = () => {
    // This will redirect to the main page (example: root "/")
    window.location.href = "/";
  };

  return (
    <div className="header">
      <h1 className="company-name">Report Page</h1>
      <div className="header-icons">
        <FaDesktop className="icon" />
        <FaSyncAlt className="icon" onClick={handleRefresh} />
      </div>
    </div>
  );
};

export default Header;
