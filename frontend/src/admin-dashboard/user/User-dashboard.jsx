import React from "react";

const handleLogout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const UserDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="text-center mt-5">
      <h1>🙋 User Dashboard</h1>
      <h3>Welcome {user?.name}</h3>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout} className="btn btn-info">Log Out </button>
    </div>
  );
};

export default UserDashboard;
