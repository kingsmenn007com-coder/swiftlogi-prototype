import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    onLogin(data.user);
                } else {
                    setMsg({ type: 'success', text: '✅ Account Ready! Please Login.' });
                    setIsLogin(true);
                }
            } else { setMsg({ type: 'error', text: data.error }); }
        } catch (err) { setMsg({ type: 'error', text: 'Connection Error' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi V6</h1>
                {msg.text && <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">I want to Buy/Sell Items</option>
                        <option value="rider">I want to Deliver (Rider)</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-xs text-indigo-600 font-bold uppercase hover:underline">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);

    const fetchAll = useCallback(async () => {
        const [pRes, oRes] = await Promise.all([fetch(`${API_URL}/products`), fetch(`${API_URL}/user/orders/${user.id}`)]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
        if (user.role === 'rider') {
            const jRes = await fetch(`${API_URL}/jobs`);
            setJobs(await jRes.json());
        }
    }, [user.id, user.role]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleBuy = async (product) => {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product._id, buyerId: user.id, sellerId: product.seller, price: product.price })
        });
        if (res.ok) { alert("✅ Order Placed! Moving to History."); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded-xl shadow-sm flex justify-between items-center max-w-4xl mx-auto border-b-2 border-indigo-100">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{user.role}</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow hover:bg-red-700">LOGOUT</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-500">
                    <h2 className="text-xl font-bold uppercase">Welcome, {user.name}</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Global Logistics Network</p>
                </div>

                {user.role === 'rider' ? (
                    <section>
                        <h3 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-tighter">Nearby Delivery Jobs</h3>
                        {jobs.map(j => (
                            <div key={j._id} className="bg-white p-4 rounded-xl shadow mb-2 flex justify-between border-l-4 border-green-500">
                                <div><p className="font-bold">{j.product?.name}</p><p className="text-xs font-bold text-green-600">₦2,500 Payout</p></div>
                                <button className="bg-indigo-600 text-white px-4 py-1 rounded-lg text-xs font-bold">Accept</button>
                            </div>
                        ))}
                    </section>
                ) : (
                    <section>
                        <h3 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-tighter">Available Goods (All Sellers)</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition border-t-4 border-indigo-500">
                                    <h3 className="font-black text-gray-800">{p.name}</h3>
                                    <p className="text-2xl font-black text-indigo-600">₦{p.price.toLocaleString()}</p>
                                    <button onClick={() => handleBuy(p)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg">Buy Now</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h3 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-tighter">Personal History (Buying & Selling)</h3>
                    {orders.length === 0 ? <p className="text-center p-10 bg-white rounded-2xl border-2 border-dashed text-gray-400">No activity yet</p> : orders.map(o => (
                        <div key={o._id} className="bg-white p-4 rounded-xl shadow mb-2 flex justify-between border-l-4 border-indigo-300">
                            <div><p className="font-bold">{o.product?.name}</p><p className="text-[10px] uppercase font-black text-indigo-500">{o.status}</p></div>
                            <span className="text-[10px] font-black bg-gray-100 p-1 rounded">₦{o.price.toLocaleString()}</span>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Dashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
