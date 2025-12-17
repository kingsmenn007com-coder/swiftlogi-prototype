import React, { useState, useEffect, useCallback } from 'react';

// ROOT FIX: Direct link to Render to stop "Failed to Fetch" errors
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
                    setMsg({ type: 'success', text: '✅ Registered Successfully! Please Login.' });
                    setIsLogin(true);
                }
            } else { setMsg({ type: 'error', text: data.error || 'Invalid Credentials' }); }
        } catch (err) { setMsg({ type: 'error', text: '❌ Connection Error. Is the Render backend awake?' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h2 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic">SwiftLogi</h2>
                
                {msg.text && (
                    <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-700 text-center">{isLogin ? 'Login' : 'Create Account'}</h3>
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-xs font-bold text-indigo-600 uppercase">
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {!isLogin && (
                        <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option>
                        </select>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-black uppercase hover:bg-indigo-700 transition shadow-lg">
                        {isLogin ? 'Sign In' : 'Register Now'}
                    </button>
                </form>

                {/* THE SWITCH TO REGISTER BUTTON (ROOT FIX) */}
                <div className="mt-6 text-center border-t pt-4">
                    <p className="text-sm text-gray-500 font-bold mb-2 uppercase">{isLogin ? "No account?" : "Already a member?"}</p>
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
    useEffect(() => {
        fetch(`${API_URL}/user/orders`).then(res => res.json()).then(data => setOrders(data)).catch(e => console.error(e));
    }, []);

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded font-bold uppercase text-xs">Logout</button>
            </header>
            <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4 uppercase border-b pb-2">User: {user.name} ({user.role})</h2>
                <div className="space-y-2">
                    {orders.length === 0 ? <p className="text-gray-400 italic text-center">No orders found in database.</p> : 
                        orders.map(o => (
                            <div key={o._id} className="p-4 bg-white shadow rounded border-l-4 border-indigo-600 flex justify-between">
                                <span className="font-bold">{o.product?.name || 'Item'}</span>
                                <span className="text-indigo-600 font-black uppercase text-xs">{o.status}</span>
                            </div>
                        ))
                    }
                </div>
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
