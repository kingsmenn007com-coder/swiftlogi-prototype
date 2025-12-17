import React, { useState, useEffect, useCallback } from 'react';

// DIRECT LINK TO YOUR BACKEND (Prevents localhost errors)
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
            // Force a fresh fetch by adding a timestamp
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
                    setMsg({ type: 'success', text: '✅ Registration Successful! Please Login.' });
                    setIsLogin(true);
                }
            } else { setMsg({ type: 'error', text: data.error || 'Invalid details' }); }
        } catch (err) { 
            setMsg({ type: 'error', text: '❌ Connection Error. Backend might be sleeping on Render.' }); 
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase tracking-tighter italic">
                    {isLogin ? 'Login' : 'Register'}
                </h2>
                {msg.text && (
                    <div className={`mb-4 p-4 rounded font-bold text-center text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-xs font-bold text-indigo-600 uppercase hover:text-indigo-800">
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {!isLogin && (
                        <select className="w-full p-3 border rounded-lg bg-white outline-none" onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="buyer">Buyer (Order Goods)</option>
                            <option value="seller">Seller (Post Items)</option>
                            <option value="rider">Rider (Deliver Items)</option>
                        </select>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-black uppercase hover:bg-indigo-700 transition shadow-md">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {/* THE MISSING TOGGLE BUTTON (ROOT FIX) */}
                <div className="mt-6 text-center border-t pt-4">
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">
                        {isLogin ? "No account?" : "Already a member?"}
                    </p>
                    <button 
                        type="button"
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

    return (
        <div className="min-h-screen bg-gray-50 p-4 text-center">
            <h1 className="text-3xl font-black text-indigo-700 italic mb-4">SWIFTLOGI</h1>
            <p className="mb-4 font-bold">Welcome, {user.name} ({user.role})</p>
            <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded font-bold">Logout</button>
            <div className="mt-8 max-w-md mx-auto">
                <h2 className="font-bold border-b-2 mb-4">Your Activity History</h2>
                {orders.length === 0 ? <p className="text-gray-400">No orders found.</p> : orders.map(o => (
                    <div key={o._id} className="p-3 border mb-2 bg-white shadow-sm rounded flex justify-between">
                        <span>{o.product?.name || 'Item'}</span>
                        <span className="font-bold text-indigo-600 uppercase">{o.status}</span>
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
