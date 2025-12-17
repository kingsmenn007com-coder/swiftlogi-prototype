import React, { useState, useEffect } from 'react';

// VERSION 4 - NO LOCALHOST FALLBACK
const API_URL = "https://swiftlogi-backend.onrender.com/api";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Connecting to Cloud...' });
        try {
            const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                if (isLogin) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);
                    onLogin(data.user);
                } else {
                    setStatus({ type: 'success', msg: '✅ Success! You can Login now.' });
                    setIsLogin(true);
                }
            } else { setStatus({ type: 'error', msg: data.error || 'Invalid Details' }); }
        } catch (err) { setStatus({ type: 'error', msg: '❌ ERR: Connection Refused. Check Render status.' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi v4</h1>
                {status.msg && <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.msg}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-xs font-black text-indigo-600 uppercase">{showPassword ? 'Show' : 'Hide'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded bg-white" onChange={e => setFormData({...formData, role: e.target.value})}><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded font-black uppercase shadow-lg">{isLogin ? 'Sign In' : 'Register'}</button>
                </form>
                <div className="mt-6 text-center border-t pt-4">
                    <button onClick={() => { setIsLogin(!isLogin); setStatus({type:'', msg:''}); }} className="text-indigo-600 font-black hover:underline uppercase text-sm">
                        {isLogin ? "Need an account? Switch to Register" : "Have an account? Switch to Login"}
                    </button>
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
    return user ? (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold">Welcome {user.name}</h1>
            <p className="font-bold text-indigo-600 uppercase mt-2">{user.role}</p>
            <button onClick={() => { localStorage.clear(); setUser(null); }} className="bg-red-600 text-white p-2 rounded mt-6 font-bold uppercase shadow">Logout</button>
        </div>
    ) : <Auth onLogin={u => setUser(u)} />;
}
