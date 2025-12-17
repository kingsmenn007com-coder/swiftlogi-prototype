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

// --- Auth Component: Handles Login and Register UI ---
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
                    // Show Clear Success UI and switch to Login
                    setSuccessMessage("✅ Registration Successful! Please use the form below to Log In.");
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
                <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6">
                    {isLogin ? 'Login to SwiftLogi' : 'Register for SwiftLogi'}
                </h2>

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded text-sm font-bold">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center font-medium text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition"
                        >
                            {showPassword ? "HIDE" : "SHOW"}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Account Role</label>
                            <select 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="buyer">Buyer (Place Orders)</option>
                                <option value="seller">Seller (Sell Products)</option>
                                <option value="rider">Rider (Deliver Goods)</option>
                            </select>
                        </div>
                    )}

                    <Button type="submit" className="w-full py-3 text-lg mt-2">
                        {isLogin ? 'Login Now' : 'Create My Account'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-600 font-medium border-t pt-4">
                    {isLogin ? "Need a new account?" : "Already a member?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
                        className="ml-2 text-indigo-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Register here' : 'Log in here'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- History & Marketplace Components ---
const OrderHistory = ({ user, orders, loading }) => {
    const titles = { buyer: 'Your Orders', seller: 'Sales History', rider: 'Jobs History' };
    if (loading) return <div className="p-4 text-center">Loading Data...</div>;
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">{titles[user.role] || 'Orders'}</h2>
            {orders.length === 0 ? <p className="text-gray-400 italic bg-white p-4 rounded shadow">No history found yet.</p> : 
                orders.map(o => (
                    <div key={o._id} className="bg-white p-4 rounded shadow border mb-3 flex justify-between items-center hover:border-indigo-300 transition">
                        <div><p className="font-bold">{o.product?.name || 'SwiftLogi Item'}</p><p className="text-sm">₦{o.price.toLocaleString()}</p></div>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase tracking-wider">{o.status}</span>
                    </div>
                ))
            }
        </div>
    );
};

const Marketplace = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
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
            if (user.role === 'rider') {
                const jRes = await fetch(`${API_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
                setJobs(await jRes.json());
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [user.role]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded shadow flex justify-between items-center max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 tracking-tighter italic">SWIFTLOGI</h1>
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">{user.role.toUpperCase()}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-red-700 transition">Logout</button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto">
                {user.role === 'rider' ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Available Delivery Jobs</h2>
                        {jobs.length === 0 ? <p className="bg-white p-6 rounded shadow text-gray-500 italic">No pending jobs.</p> : jobs.map(j => (
                            <div key={j.orderId} className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center border-l-4 border-green-500">
                                <div><p className="font-bold">{j.productName}</p><p className="text-sm font-bold text-green-600">₦{j.riderPayout}</p></div>
                                <Button onClick={() => alert("Job Accepted")}>Accept Job</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Available Logistics Items</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-indigo-500 hover:shadow-md transition">
                                    <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                                    <p className="text-indigo-600 font-black text-2xl mt-1">₦{p.price.toLocaleString()}</p>
                                    <Button className="mt-4 w-full uppercase tracking-widest text-xs" onClick={() => alert("Purchase Logic Active")}>Buy Now</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <OrderHistory user={user} orders={orders} loading={loading} />
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

    if (checking) return <div className="p-10 text-center font-bold text-indigo-600">Initializing SwiftLogi Platform...</div>;

    return user ? (
        <Marketplace user={user} onLogout={() => { localStorage.clear(); setUser(null); }} />
    ) : (
        <Auth onLogin={(u) => setUser(u)} />
    );
}
