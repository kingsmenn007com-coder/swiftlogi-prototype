import React, { useState, useEffect, useCallback } from 'react';

// Root Fix: Explicit fallback to ensure "Failed to Fetch" stops happening
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
                    setMsg({ type: 'success', text: '✅ Registered! Please Login.' });
                    setIsLogin(true);
                }
            } else { setMsg({ type: 'error', text: data.error || 'Failed' }); }
        } catch (err) { setMsg({ type: 'error', text: '❌ Failed to fetch backend. Is it awake?' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Login' : 'Register'}</h2>
                {msg.text && <div className={`mb-4 p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-xs font-bold text-indigo-600">{showPassword ? 'HIDE' : 'SHOW'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-2 border rounded bg-white" onChange={e => setFormData({...formData, role: e.target.value})}><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded font-bold uppercase">{isLogin ? 'Sign In' : 'Register Account'}</button>
                </form>
                {/* Fixed Register Link */}
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-indigo-600 font-bold hover:underline">
                    {isLogin ? "Need an account? Register here" : "Have an account? Login here"}
                </button>
            </div>
        </div>
    );
};

const Marketplace = ({ user, onLogout }) => {
    const [orders, setOrders] = useState([]);
    const fetchOrders = useCallback(async () => {
        const res = await fetch(`${API_URL}/user/orders`);
        if (res.ok) setOrders(await res.json());
    }, []);
    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleDeliver = async (id) => {
        const res = await fetch(`${API_URL}/jobs/${id}/deliver`, { method: 'POST' });
        if (res.ok) { alert("Delivered!"); fetchOrders(); }
    };

    return (
        <div className="p-4">
            <header className="flex justify-between items-center mb-6 bg-white p-4 shadow rounded">
                <h1 className="font-bold text-indigo-700">SWIFTLOGI</h1>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold bg-indigo-100 p-1 rounded uppercase">{user.role}</span>
                    <button onClick={onLogout} className="text-red-500 text-sm font-bold">Logout</button>
                </div>
            </header>
            <div className="max-w-2xl mx-auto">
                <h2 className="font-bold mb-4 uppercase">Order History</h2>
                {orders.map(o => (
                    <div key={o._id} className="bg-white p-4 rounded shadow mb-2 flex justify-between items-center">
                        <div><p className="font-bold">{o.product?.name}</p><p className="text-xs text-gray-500">{o.status.toUpperCase()}</p></div>
                        {user.role === 'rider' && o.status === 'shipped' && (
                            <button onClick={() => handleDeliver(o._id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Mark Delivered</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Marketplace user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
