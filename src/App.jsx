import React, { useState } from 'react';
import LogisticsMarketplaceApp from './LogisticsMarketplaceApp';
import Login from './Login';
import Register from './Register'; // <-- NEW IMPORT

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login'); // <-- NEW STATE: 'login' or 'register'

    // Function to check local storage for token on initial load (optional, but good practice)
    // You can add logic here to fetch the user if a token exists. For now, we will keep it simple.
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         // Here you would typically decode the token or call an API to validate and get user data
    //         // For this prototype, we'll rely on the manual login/register flow.
    //     }
    // }, []);

    const handleLoginOrRegister = (userData) => {
        setUser(userData);
        setView('marketplace'); // Switch to the main app view
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
                <LogisticsMarketplaceApp user={user} />
            )}
        </div>
    );
}

export default App;
