import React, { useState } from 'react';
import LogisticsMarketplaceApp from './LogisticsMarketplaceApp';
import Login from './Login';
import Register from './Register'; // NEW IMPORT

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // NEW STATE

  // This function clears the user state, triggering the App to show the Login component
  const handleLogout = () => {
    setUser(null);
  };

  // --- CONDITIONAL RENDERING ---

  if (user) {
    // User is logged in, show the main application
    return (
      <LogisticsMarketplaceApp user={user} onLogout={handleLogout} />
    );
  }

  if (isRegistering) {
    // User wants to register
    return (
      <Register 
        onRegisterSuccess={(userData) => setUser(userData)}
        onSwitchToLogin={() => setIsRegistering(false)} 
      />
    );
  }

  // Default: User is not logged in and not registering
  return (
    <Login 
      onLogin={(userData) => setUser(userData)} 
      onSwitchToRegister={() => setIsRegistering(true)} // NEW PROP FOR SWITCH
    />
  );
}

export default App;
