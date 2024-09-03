import React from "react";
import Cookies from "js-cookie";

function Dashboard() {
  const handleLogout = () => {
    Cookies.remove("authToken");
    window.location.reload();
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
