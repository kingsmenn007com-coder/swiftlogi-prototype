import React, { useState, useEffect, useCallback } from 'react';

// Hardcoded for reliability
const API_URL = "https://swiftlogi-backend.onrender.com/api"; 

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            // Cache-busting URL to force a fresh fetch
            const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}?t=${Date.now()}`, {
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
                    setMsg({ type: 'success', text: '✅ Account Ready! Please Login Now.' });
                    setIsLogin(true);
                }
            } else { setMsg({ type: 'error', text: data.error || 'Invalid details' }); }
        } catch (err) { setMsg({ type: 'error', text: '❌ Backend Connection Error. Please refresh.' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase">
                    {isLogin ? 'Login' : 'Register'}
                </h2>
                {msg.text && <div className={`mb-4 p-4 rounded font-bold text-center text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-xs font-bold text-indigo-600 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && (
                        <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option>
                        </select>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-black uppercase hover:bg-indigo-700 transition">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                {/* THE MISSING BUTTON FIX */}
                <div className="mt-6 text-center border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">{isLogin ? "No account?" : "Have an account?"}</p>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setMsg({type:'', text:''}); }} 
                        className="text-indigo-600 font-black hover:underline uppercase text-sm"
                    >
                        {isLogin ? "Switch to Register" : "Switch to Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Marketplace = ({ user, onLogout }) => {
    const [orders, setOrders] = useState([]);
    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/user/orders?t=${Date.now()}`);
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error("Fetch error", e); }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleDeliver = async (id) => {
        const res = await fetch(`${API_URL}/jobs/${id}/deliver`, { method: 'POST' });
        if (res.ok) { alert("Status: Delivered!"); fetchOrders(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="flex justify-between items-center mb-8 bg-white p-4 shadow rounded-lg max-w-4xl mx-auto">
                <h1 className="font-black text-2xl text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase">{user.role}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-bold shadow hover:bg-red-700 transition">LOGOUT</button>
                </div>
            </header>
            <div className="max-w-2xl mx-auto">
                <h2 className="font-black text-xl mb-6 text-gray-800 uppercase tracking-widest border-b-2 border-indigo-200 pb-2">Order Tracking</h2>
                {orders.length === 0 ? <p className="text-center text-gray-400 italic">No orders found.</p> : orders.map(o => (
                    <div key={o._id} className="bg-white p-5 rounded-xl shadow-sm mb-4 flex justify-between items-center border-l-4 border-indigo-500">
                        <div>
                            <p className="font-black text-gray-800">{o.product?.name || 'Package'}</p>
                            <p className="text-xs font-bold text-indigo-500 uppercase">{o.status}</p>
                        </div>
                        {user.role === 'rider' && o.status === 'shipped' && (
                            <button onClick={() => handleDeliver(o._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-green-700 transition shadow-md">Complete Delivery</button>
                        )}
                    </div>
                ))}
            </div>
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
