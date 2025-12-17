import React, { useState, useEffect, useCallback } from 'react';

// MANUAL SYNC VERSION - HARDCODED API
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
            const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}?v=manual_sync`, {
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
                    setMsg({ type: 'success', text: '✅ Account Ready! Please switch to Login.' });
                }
            } else { setMsg({ type: 'error', text: data.error || 'Invalid credentials' }); }
        } catch (err) { setMsg({ type: 'error', text: '❌ Connection Error: Backend not found.' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-700">
                <h1 className="text-2xl font-black text-center text-indigo-800 mb-2 italic">SWIFTLOGI (MANUAL SYNC)</h1>
                <p className="text-center text-xs text-gray-400 mb-6 font-bold uppercase">Cloud Connection: ACTIVE</p>
                
                {msg.text && <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-xs font-bold text-indigo-600 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded bg-white" onChange={e => setFormData({...formData, role: e.target.value})}><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-700 text-white p-3 rounded font-black uppercase hover:bg-indigo-800 transition">{isLogin ? 'Sign In' : 'Register'}</button>
                </form>

                <div className="mt-6 pt-4 border-t text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setMsg({type:'', text:''}); }} className="text-indigo-700 font-black hover:underline uppercase text-sm">
                        {isLogin ? "Go to Register" : "Go to Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Marketplace = ({ user, onLogout }) => (
    <div className="p-10 text-center">
        <h1 className="text-3xl font-bold">Logged In as {user.name}</h1>
        <button onClick={onLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded font-bold">LOGOUT</button>
    </div>
);

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { 
        const u = localStorage.getItem('user'); 
        if(u) setUser(JSON.parse(u)); 
    }, []);
    return user ? <Marketplace user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
