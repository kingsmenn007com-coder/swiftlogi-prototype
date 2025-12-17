import React, { useState, useEffect, useCallback } from 'react';

// Hardcoded Render Backend URL
const API_URL = "https://swiftlogi-backend.onrender.com/api";

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
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Connecting...' });
        try {
            const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}`, {
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
                    setStatus({ type: 'success', msg: '✅ Success! Please Login.' });
                    setIsLogin(true);
                }
            } else { setStatus({ type: 'error', msg: data.error || 'Check details' }); }
        } catch (err) { setStatus({ type: 'error', msg: '❌ Connection Error.' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi V4</h1>
                {status.msg && <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.msg}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-xs font-black text-indigo-600 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded bg-white" onChange={e => setFormData({...formData, role: e.target.value})}><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded font-black uppercase shadow-lg">{isLogin ? 'Sign In' : 'Register'}</button>
                </form>
                <div className="mt-6 text-center border-t pt-4">
                    <button onClick={() => { setIsLogin(!isLogin); setStatus({type:'', msg:''}); }} className="text-indigo-600 font-black hover:underline uppercase text-sm">
                        {isLogin ? "Need an account? Register here" : "Have an account? Login here"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- History Component ---
const OrderHistory = ({ user, orders, loading, onUpdate }) => {
    const titles = { buyer: 'Your Orders', seller: 'Sales History', rider: 'My Shipments' };
    if (loading) return <div className="p-4 text-center">Loading...</div>;
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700 uppercase tracking-tight">{titles[user.role] || 'Orders'}</h2>
            {orders.length === 0 ? <p className="text-gray-400 italic bg-white p-4 rounded shadow">No activity found.</p> : 
                orders.map(o => (
                    <div key={o._id} className="bg-white p-4 rounded shadow border mb-3 flex justify-between items-center">
                        <div><p className="font-bold">{o.product?.name || 'Product'}</p><p className="text-sm">₦{(o.price || 0).toLocaleString()}</p></div>
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
const Marketplace = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const [pRes, oRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/user/orders`)
            ]);
            setProducts(await pRes.json());
            const allOrders = await oRes.json();
            if (user.role === 'rider') {
                setOrders(allOrders.filter(o => o.rider?._id === (user.id || user._id)));
                const jRes = await fetch(`${API_URL}/jobs`);
                setJobs(await jRes.json());
            } else { setOrders(allOrders); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleDeliver = async (orderId) => {
        const res = await fetch(`${API_URL}/jobs/${orderId}/deliver`, { method: 'POST' });
        if (res.ok) { alert("Delivered!"); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded shadow flex justify-between items-center max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{user.role}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold shadow">Logout</button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto">
                {user.role === 'rider' ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4 uppercase">Open Delivery Jobs</h2>
                        {jobs.map(j => (
                            <div key={j.orderId} className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center border-l-4 border-green-500">
                                <div><p className="font-bold">{j.productName}</p><p className="text-sm font-bold text-green-600">₦{j.riderPayout}</p></div>
                                <Button onClick={() => alert("Accept Logic Active")}>Accept</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-4 uppercase">Marketplace</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded shadow border-t-4 border-indigo-500">
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <p className="text-indigo-600 font-black">₦{p.price.toLocaleString()}</p>
                                    <Button className="mt-4 w-full text-xs font-bold uppercase">Buy Now</Button>
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

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { 
        const u = localStorage.getItem('user'); 
        if(u) setUser(JSON.parse(u)); 
    }, []);
    return user ? <Marketplace user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
