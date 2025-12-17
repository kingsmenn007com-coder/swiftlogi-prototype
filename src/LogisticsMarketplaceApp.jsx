import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = `${API_BASE_URL}/api`;

const Button = ({ children, onClick, className = '', type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition duration-200 
                    bg-indigo-600 text-white hover:bg-indigo-700 ${className}`}
    >
        {children}
    </button>
);

// --- Auth Component: Root fix for Register Toggle and Password Reveal ---
const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const endpoint = isLogin ? '/login' : '/register';
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    onLogin(data.user);
                } else {
                    setSuccessMessage("✅ Registration Successful! Please log in below.");
                    setIsLogin(true); 
                }
            } else {
                setError(data.error || 'Operation failed. Please try again.');
            }
        } catch (err) {
            setError('Connection failed. Please ensure your Backend is active.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6 uppercase tracking-tight">
                    {isLogin ? 'Login' : 'Register'}
                </h2>

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm font-bold text-sm">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition uppercase"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Select Role</label>
                            <select 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="buyer">Buyer (Order Goods)</option>
                                <option value="seller">Seller (Post Items)</option>
                                <option value="rider">Rider (Deliver Items)</option>
                            </select>
                        </div>
                    )}

                    <Button type="submit" className="w-full py-3 text-lg mt-2 uppercase font-black">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-600 font-medium border-t pt-4">
                    {isLogin ? "No account?" : "Already joined?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
                        className="ml-2 text-indigo-600 font-black hover:underline underline-offset-4"
                    >
                        {isLogin ? 'Register here' : 'Log in here'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const Marketplace = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const [pRes, oRes] = await Promise.all([
                fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/user/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setProducts(await pRes.json());
            setOrders(await oRes.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded shadow flex justify-between items-center max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">{user.role.toUpperCase()}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-red-700 transition">Logout</button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase tracking-tight">Active Items</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {products.map(p => (
                        <div key={p._id} className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-indigo-500 hover:shadow-md transition">
                            <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                            <p className="text-indigo-600 font-black text-2xl mt-1">₦{p.price.toLocaleString()}</p>
                            <Button className="mt-4 w-full uppercase tracking-widest text-xs font-bold" onClick={() => alert("Buy Clicked")}>Order Now</Button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setChecking(false);
    }, []);

    if (checking) return <div className="p-10 text-center font-bold text-indigo-600 animate-pulse">Initializing SwiftLogi...</div>;

    return user ? (
        <Marketplace user={user} onLogout={() => { localStorage.clear(); setUser(null); }} />
    ) : (
        <Auth onLogin={(u) => setUser(u)} />
    );
}
