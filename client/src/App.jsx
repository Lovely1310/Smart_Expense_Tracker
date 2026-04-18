import React, { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  if (!token) {
    return <Auth setToken={setToken} setUser={setUser} />;
  }

  return <Dashboard user={user} setToken={setToken} />;
}

export default App;