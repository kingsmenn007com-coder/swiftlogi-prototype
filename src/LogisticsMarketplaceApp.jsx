import React, { useState, useEffect, useCallback } from 'react';

// ROOT FIX: Explicitly pointing to Render Cloud to stop "Failed to Fetch"
const API_URL = "https://swiftlogi-backend.onrender.com/api"; 

// --- Reusable Button Component ---
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

// --- Auth Component (Login/Register with Success Signals) ---
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
            const res = await fetch(`${API_URL}${endpoint}?t=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                if (isLogin) {
                    // PERSISTENCE FIX: Save both token AND user object
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    onLogin(data.user);
                } else {
                    setSuccessMessage("✅ Registration Successful! Please log in below.");
                    setIsLogin(true); 
                }
            } else {
                setError(data.error || 'Invalid credentials or connection error');
            }
        } catch (err) {
            setError('❌ Failed to connect to backend. Verify your Render server is UP.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic">
                    {isLogin ? 'Welcome Back' : 'Join SwiftLogi'}
                </h2>

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded text-center font-bold">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center font-medium">
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
                            className="absolute right-3 top-3.5 text-indigo-600 font-bold text-xs uppercase"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {!isLogin && (
                        <select 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="buyer">Buyer (Place Orders)</option>
                            <option value="seller">Seller (Sell Products)</option>
                            <option value="rider">Rider (Deliver Goods)</option>
                        </select>
                    )}
                    <Button type="submit" className="w-full py-3 text-lg uppercase font-black">
                        {isLogin ? 'Login' : 'Register Account'}
                    </Button>
                </form>

                {/* THE REGISTER TOGGLE BUTTON (FIXED) */}
                <div className="mt-6 text-center border-t pt-4">
                    <p className="text-sm text-gray-500 font-bold mb-2 uppercase">{isLogin ? "No account?" : "Already a member?"}</p>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
                        className="text-indigo-600 font-black hover:underline uppercase text-sm"
                    >
                        {isLogin ? "Switch to Register" : "Switch to Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- History Component ---
const OrderHistory = ({ user, orders, loading, onUpdate }) => {
    const titles = { buyer: 'Your Orders', seller: 'Sales History', rider: 'My Shipments' };
    if (loading) return <div className="p-4 text-center">Loading Data...</div>;
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700 uppercase tracking-tight">{titles[user.role] || 'Orders'}</h2>
            {orders.length === 0 ? <p className="text-gray-400 italic bg-white p-4 rounded shadow">No history found yet.</p> : 
                orders.map(o => (
                    <div key={o._id} className="bg-white p-4 rounded shadow border mb-3 flex justify-between items-center">
                        <div><p className="font-bold">{o.product?.name || 'SwiftLogi Item'}</p><p className="text-sm">₦{(o.price || 0).toLocaleString()}</p></div>
                        <div className="flex flex-col items-end">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase mb-2 ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
                            {user.role === 'rider' && o.status === 'shipped' && (
                                <Button onClick={() => onUpdate(o._id)} className="bg-green-600 hover:bg-green-700 text-xs py-1">Mark Delivered</Button>
                            )}
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

// --- Main Marketplace Component ---
const LogisticsMarketplaceApp = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const [pRes, oRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/user/orders`)
            ]);
            setProducts(await pRes.json());
            const allOrders = await oRes.json();
            if (user.role === 'rider') {
                setOrders(allOrders.filter(o => o.rider?._id === user.id || o.rider === user.id));
                const jRes = await fetch(`${API_URL}/jobs`);
                setJobs(await jRes.json());
            } else { setOrders(allOrders); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [user.id, user.role]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleDeliver = async (orderId) => {
        const res = await fetch(`${API_URL}/jobs/${orderId}/deliver`, { method: 'POST' });
        if (res.ok) { alert("Package Delivered!"); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded shadow flex justify-between items-center max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 uppercase">{user.role}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-red-700 transition">Logout</button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto">
                {user.role === 'rider' ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4 uppercase tracking-tight">Open Jobs</h2>
                        {jobs.map(j => (
                            <div key={j.orderId} className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center border-l-4 border-green-500">
                                <div><p className="font-bold">{j.productName}</p><p className="text-sm font-bold text-green-600">₦{j.riderPayout}</p></div>
                                <Button onClick={() => alert("Job Accepted!")}>Accept Job</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-4 uppercase tracking-tight text-gray-800 border-b pb-2">Marketplace</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-indigo-500 hover:shadow-md transition">
                                    <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                                    <p className="text-indigo-600 font-black text-2xl mt-1">₦{p.price.toLocaleString()}</p>
                                    <Button className="mt-4 w-full text-xs font-bold uppercase" onClick={() => alert("Order Placed!")}>Order Now</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <OrderHistory user={user} orders={orders} loading={loading} onUpdate={handleDeliver} />
            </main>
        </div>
    );
};

// --- Entry Point ---
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

    if (checking) return <div className="p-10 text-center font-bold text-indigo-600">Initializing SwiftLogi...</div>;

    return user ? (
        <LogisticsMarketplaceApp user={user} onLogout={() => { localStorage.clear(); setUser(null); }} />
    ) : (
        <Auth onLogin={(u) => setUser(u)} />
    );
}
