import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = `${API_BASE_URL}/api`;

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Registration successful: Store token and log user in immediately
            localStorage.setItem('token', data.token);
            onRegisterSuccess(data.user);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Register to SwiftLogi</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Name" 
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={name} onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="buyer">Buyer (Place Orders)</option>
                        <option value="seller">Seller (Post Products)</option>
                        <option value="rider">Rider (Accept Jobs)</option>
                    </select>
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 font-bold disabled:bg-indigo-300"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Account'}
                    </button>
                </form>
                {/* BUTTON TO SWITCH TO LOGIN VIEW */}
                <p className="text-xs text-center text-gray-500 mt-4">
                    Already have an account? <button onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-800 font-medium">Log in here</button>
                </p>
            </div>
        </div>
    );
};

export default Register;
