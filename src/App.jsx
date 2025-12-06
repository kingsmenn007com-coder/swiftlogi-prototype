import React, { useState } from 'react';
import LogisticsMarketplaceApp from './LogisticsMarketplaceApp';
import Login from './Login'; // <--- THIS IMPORT IS CRUCIAL

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {/* Renders Login if user is NULL, otherwise renders the full app */}
      {!user ? (
        <Login onLogin={(userData) => setUser(userData)} />
      ) : (
        <LogisticsMarketplaceApp user={user} />
      )}
    </div>
  );
}

export default App;
