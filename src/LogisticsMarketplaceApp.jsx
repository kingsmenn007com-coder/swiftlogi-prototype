import React, { useState, useEffect, useCallback } from 'react';

// STABLE API PATH
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

// --- Auth Component (Fixed Width & Centered) ---
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
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);
                    onLogin(data.user);
                } else {
                    setStatus({ type: 'success', msg: '✅ Registered! Please Login.' });
                    setIsLogin(true);
                }
            } else { setStatus({ type: 'error', msg: data.error || 'Invalid Details' }); }
        } catch (err) { setStatus({ type: 'error', msg: '❌ Connection Error.' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi V5</h1>
                {status.msg && <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.msg}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-xs font-black text-indigo-600 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="buyer">Register as Buyer</option>
                        <option value="seller">Register as Seller</option>
                        <option value="rider">Register as Rider</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded font-bold uppercase shadow-lg hover:bg-indigo-700 transition">
                        {isLogin ? 'Sign In' : 'Create My Account'}
                    </button>
                </form>
                <div className="mt-6 text-center border-t pt-4">
                    <button onClick={() => { setIsLogin(!isLogin); setStatus({type:'', msg:''}); }} className="text-indigo-600 font-black hover:underline uppercase text-xs tracking-widest">
                        {isLogin ? "Need an account? Register Here" : "Have an account? Login Here"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard Component (Independent Data Logic) ---
const LogisticsDashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const [pRes, oRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/user/orders/${user.id}`) // NEW: Filtering by userId
            ]);
            setProducts(await pRes.json());
            setOrders(await oRes.json());
            
            if (user.role === 'rider') {
                const jRes = await fetch(`${API_URL}/jobs`);
                setJobs(await jRes.json());
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleDeliver = async (orderId) => {
        const res = await fetch(`${API_URL}/jobs/${orderId}/deliver`, { method: 'POST' });
        if (res.ok) { alert("Status: Delivered!"); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded shadow flex justify-between items-center max-w-4xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase border border-indigo-200">{user.role}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold shadow">Logout</button>
                </div>
            </header>
            
            <main className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-l-8 border-indigo-500">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Welcome, {user.name}</h2>
                    <p className="text-gray-500 text-sm font-bold uppercase">Independent Profile</p>
                </div>
                
                {user.role === 'rider' && (
                    <div className="mb-8">
                        <h3 className="font-black text-gray-700 mb-4 uppercase tracking-widest text-sm text-center">Available Delivery Jobs</h3>
                        {jobs.length === 0 ? <p className="bg-white p-6 rounded-xl shadow italic text-gray-400 border border-dashed text-center">No available jobs found.</p> : jobs.map(j => (
                            <div key={j.orderId} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center border-l-4 border-green-500">
                                <div><p className="font-bold">{j.productName}</p><p className="text-sm font-black text-green-600">₦{j.riderPayout}</p></div>
                                <Button onClick={() => alert("Job Accepted!")}>Accept</Button>
                            </div>
                        ))}
                    </div>
                )}

                {user.role !== 'rider' && (
                    <div className="mb-8">
                        <h3 className="font-black text-gray-700 mb-4 uppercase tracking-widest text-sm text-center">Marketplace</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-500">
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <p className="text-indigo-600 font-black text-2xl mt-1">₦{p.price.toLocaleString()}</p>
                                    <Button className="mt-4 w-full text-xs font-bold uppercase tracking-widest">Buy Now</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="font-black text-gray-700 mb-4 uppercase tracking-widest text-sm text-center">Your Personal History</h3>
                    {orders.length === 0 ? <p className="bg-white p-6 rounded-xl shadow italic text-gray-400 border border-dashed text-center">No personal orders found.</p> : orders.map(o => (
                        <div key={o._id} className="bg-white p-5 rounded-xl shadow-sm mb-4 flex justify-between items-center border-l-4 border-indigo-400">
                            <div><p className="font-bold">{o.product?.name || 'Package'}</p><p className="text-[10px] font-black uppercase text-indigo-500">{o.status}</p></div>
                            {user.role === 'rider' && o.status === 'shipped' && (
                                <button onClick={() => handleDeliver(o._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase shadow-md">Mark Delivered</button>
                            )}
                        </div>
                    ))}
                </div>
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

    return user ? <LogisticsDashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
