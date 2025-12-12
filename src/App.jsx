import React, { useState } from 'react';
import LogisticsMarketplaceApp from './LogisticsMarketplaceApp';
import Login from './Login'; 

function App() {
  const [user, setUser] = useState(null);

  // This function clears the user state, triggering the App to show the Login component
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {/* Renders Login if user is NULL, otherwise renders the full app */}
      {!user ? (
        <Login onLogin={(userData) => setUser(userData)} />
      ) : (
        // Pass the user data AND the logout handler to the main app component
        <LogisticsMarketplaceApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
