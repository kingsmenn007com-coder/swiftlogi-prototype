import React, { useState, useEffect } from 'react';

// VERSION 3.1 - ABSOLUTE CLOUD LOCK (MANUAL BYPASS)
const RENDER_BACKEND = "https://swiftlogi-backend.onrender.com/api";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Connecting to Cloud...' });
        try {
            const url = `${RENDER_BACKEND}${isLogin ? '/login' : '/register'}`;
            const res = await fetch(url, {
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
                    setStatus({ type: 'success', msg: '✅ Registration Success! Please Login.' });
                    setIsLogin(true);
                }
            } else { setStatus({ type: 'error', msg: data.error || 'Check details' }); }
        } catch (err) { setStatus({ type: 'error', msg: '❌ Connection Refused. Ensure Backend is awake on Render.' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-b-8 border-indigo-500">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-indigo-900 italic tracking-tighter">SWIFTLOGI v3.1</h1>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase border border-green-200">Manual Sync Active</span>
                </div>

                {status.msg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${status.type === 'success' ? 'bg-green-100 text-green-700' : status.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && (
                        <select className="w-full p-3 border-2 border-gray-100 rounded-xl bg-white outline-none" onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="rider">Rider</option>
                        </select>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black uppercase hover:bg-indigo-700 transition tracking-widest">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 pt-4 border-t-2 border-gray-50 text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setStatus({type:'', msg:''}); }} className="text-indigo-600 font-black hover:underline uppercase text-xs tracking-widest">
                        {isLogin ? "No account? Register Here" : "Have an account? Login Here"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Marketplace = ({ user, onLogout }) => (
    <div className="p-10 text-center bg-indigo-50 min-h-screen">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm mx-auto">
            <h1 className="text-2xl font-black text-indigo-900">Logged In</h1>
            <p className="text-gray-500 font-bold mt-2 uppercase text-xs">{user.name} | {user.role}</p>
            <button onClick={onLogout} className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full font-black text-xs hover:bg-red-600 transition">Logout</button>
        </div>
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
