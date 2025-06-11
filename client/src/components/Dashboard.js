import React from 'react';

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    // For simplicity, redirecting to login. In a real app, you might want to use useNavigate() from react-router-dom
    window.location.href = '/login';
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to your protected dashboard!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
