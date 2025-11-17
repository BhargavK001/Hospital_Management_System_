import React from "react";
import { FaBars } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import admin from "../images/admin.png"

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar navbar-dark bg-primary px-3 d-flex justify-content-between align-items-center">
      {/* {hambourger menu} */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-outline-light border-0"
          onClick={toggleSidebar}
        >
          <FaBars size={22} />
        </button>
        <h4 className="text-white fw-bold mb-0">One Care Admin</h4>
      </div>

      {/*Profile */}
      <div className="d-flex align-items-center">
        <img
          src={admin}
          alt="User Avatar"
          width="35"
          height="35"
          className="rounded-circle"
          
        />
        <span className="text-white ms-2 fw-semibold">Admin</span>
      </div>
    </nav>
  );
};

export default Navbar;
