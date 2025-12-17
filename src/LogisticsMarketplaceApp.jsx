import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = `${API_BASE_URL}/api`;

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

// --- Auth Component (Login/Register) ---
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
                    // Signal success and switch to login view
                    setSuccessMessage("✅ Registration Successful! Please log in now.");
                    setIsLogin(true);
                }
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('Connection failed. Please check your backend.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6">
                    {isLogin ? 'SwiftLogi Login' : 'Create Account'}
                </h2>

                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center font-bold">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
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
                            className="absolute right-3 top-3 text-xs font-bold text-indigo-600 uppercase"
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
                    <Button type="submit" className="w-full py-3 text-lg">
                        {isLogin ? 'Login to Dashboard' : 'Register Now'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    {isLogin ? "New to SwiftLogi?" : "Already have an account?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
                        className="ml-2 text-indigo-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Order History Component ---
const OrderHistory = ({ user, orders, loading }) => {
    const titles = { buyer: 'Your Orders', seller: 'Sales History', admin: 'Platform Sales', rider: 'Accepted Jobs' };
    if (loading) return <div className="p-4 text-center">Loading history...</div>;
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">{titles[user.role] || 'Orders'}</h2>
            {orders.length === 0 ? <p className="text-gray-400 italic">No transactions found.</p> : 
                orders.map(order => (
                    <div key={order._id} className="bg-white p-4 rounded shadow border mb-3 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{order.product?.name || 'Order Details'}</h3>
                            <p className="text-sm text-gray-600">Total: ₦{(order.price + (order.deliveryFee || 0)).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.status.toUpperCase()}
                        </span>
                    </div>
                ))
            }
        </div>
    );
};

// --- Dashboard Component ---
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
                fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/user/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setProducts(await pRes.json());
            setOrders(await oRes.json());
            if (user.role === 'rider' || user.role === 'admin') {
                const jRes = await fetch(`${API_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
                setJobs(await jRes.json());
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [user.role]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleBuy = async (product) => {
        const token = localStorage.getItem('token');
        const sellerId = product.seller?._id || product.seller;
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ productId: product._id, price: product.price, sellerId, deliveryFee: 1500 })
        });
        if (res.ok) { alert("Order Placed!"); fetchAll(); }
    };

    const handleAccept = async (orderId) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/jobs/${orderId}/accept`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { alert("Job Accepted!"); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded shadow flex justify-between items-center max-w-5xl mx-auto w-full">
                <h1 className="text-2xl font-black text-indigo-700">SwiftLogi</h1>
                <div className="flex items-center space-x-4">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{user.role}</span>
                    <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs font-bold">Logout</button>
                </div>
            </header>
            
            <main className="max-w-5xl mx-auto w-full">
                {user.role === 'rider' ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Available Delivery Jobs</h2>
                        {jobs.length === 0 ? <p className="bg-white p-4 rounded shadow italic text-gray-400">Searching for jobs...</p> : jobs.map(j => (
                            <div key={j.orderId} className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center">
                                <div><p className="font-bold">{j.productName}</p><p className="text-sm text-green-600 font-bold">₦{j.riderPayout}</p></div>
                                <Button onClick={() => handleAccept(j.orderId)}>Accept Job</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Marketplace</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-4 rounded shadow border border-gray-100">
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <p className="text-indigo-600 font-black text-xl mb-3">₦{p.price.toLocaleString()}</p>
                                    <Button className="w-full" onClick={() => handleBuy(p)}>Buy Now</Button>
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

// --- Entry Logic ---
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

    if (checking) return null;

    return user ? (
        <LogisticsMarketplaceApp user={user} onLogout={() => { localStorage.clear(); setUser(null); }} />
    ) : (
        <Auth onLogin={(u) => setUser(u)} />
    );
}
