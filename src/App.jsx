import React, { useState } from 'react';
import LogisticsMarketplaceApp from './LogisticsMarketplaceApp';
import Login from './Login';
import Register from './Register';

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login'); 

    const handleLoginOrRegister = (userData) => {
        setUser(userData);
        setView('marketplace'); 
    };

    // NEW: Function to clear the user state
    const handleLogout = () => {
        // Clearing the token from localStorage will be done in the component that renders the button.
        setUser(null); // This forces the app to show the login/register view
        setView('login');
    };

    const renderAuthView = () => {
        if (view === 'register') {
            return (
                <Register 
                    onRegister={handleLoginOrRegister}
                    switchToLogin={() => setView('login')}
                />
            );
        }
        // Default to Login view
        return (
            <Login 
                onLogin={handleLoginOrRegister}
                switchToRegister={() => setView('register')}
            />
        );
    };

    return (
        <div>
            {/* Renders Login/Register view if user is NULL, otherwise renders the full app */}
            {!user ? (
                renderAuthView()
            ) : (
                // PASSING THE LOGOUT FUNCTION HERE
                <LogisticsMarketplaceApp user={user} onLogout={handleLogout} /> 
            )}
        </div>
    );
}

export default App;
