import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

// --- Specialized Auth Component ---
const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
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
                    localStorage.setItem('token', data.token);
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
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase tracking-tighter">SwiftLogi V9</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">User (Buy/Sell)</option>
                        <option value="rider">Rider (Deliveries)</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg hover:bg-indigo-700 transition">
                        {isLogin ? 'Sign In' : 'Join SwiftLogi'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-xs text-indigo-600 font-bold uppercase hover:underline">
                    {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
            </div>
        </div>
    );
};

// --- Specialized Dashboard (Rider vs User) ---
const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [cart, setCart] = useState([]);

    const fetchAll = useCallback(async () => {
        const [pRes, oRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/user/orders/${user.id}`)
        ]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
        if (user.role === 'rider') {
            const jRes = await fetch(`${API_URL}/jobs`);
            setJobs(await jRes.json());
        }
    }, [user.id, user.role]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(item => item._id === product._id);
            if (exists) return prev.map(item => item._id === product._id ? {...item, qty: item.qty + 1} : item);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                buyerId: user.id, 
                items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.qty })),
                totalPrice 
            })
        });
        if (res.ok) { 
            alert("✅ Checkout Successful!"); 
            setCart([]); 
            fetchAll(); 
        }
    };

    const handleAcceptJob = async (orderId) => {
        const res = await fetch(`${API_URL}/jobs/${orderId}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ riderId: user.id })
        });
        if (res.ok) { alert("Job Accepted!"); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm flex justify-between items-center max-w-6xl mx-auto border-b">
                <h1 className="text-2xl font-black text-indigo-700 italic uppercase">SwiftLogi</h1>
                <div className="flex items-center gap-4">
                    {user.role === 'user' && (
                        <div className="text-right border-r pr-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cart ({cart.length})</span>
                            <p className="text-xs font-black text-indigo-600 font-mono">₦{cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}</p>
                        </div>
                    )}
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase border border-indigo-100">**{user.role}**</span>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase shadow">Logout</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-500">
                    <h2 className="text-xl font-black text-gray-800 uppercase italic">Welcome, {user.name}</h2>
                </div>

                {user.role === 'rider' ? (
                    /* RIDER DASHBOARD (Restored Interface) */
                    <section className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-500">
                            <h3 className="text-lg font-black text-blue-600 uppercase">Rider Status: <span className="text-green-500 italic">Available</span></h3>
                            <button onClick={fetchAll} className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded font-bold text-xs shadow-md">Refresh Jobs</button>
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mt-6">Available Delivery Jobs</h3>
                        {jobs.map(j => (
                            <div key={j._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Job ID: {j._id.substring(0,8)}</p>
                                    <p className="font-black text-gray-800 text-lg uppercase">{j.items?.[0]?.name || 'Logistics Package'}</p>
                                    <p className="text-sm font-black text-green-600 mt-1">Payout: ₦1,500</p>
                                    {/* Maps Placeholder */}
                                    <div className="mt-3 bg-gray-100 p-2 rounded text-[10px] font-bold text-gray-500 italic border border-dashed">📍 Route: Lagos Main -> Abuja Hub</div>
                                </div>
                                <button onClick={() => handleAcceptJob(j._id)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition">Accept Job</button>
                            </div>
                        ))}
                    </section>
                ) : (
                    /* USER DASHBOARD (Marketplace & Cart) */
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Marketplace</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <div key={p._id} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition border-t-4 border-indigo-500">
                                            <h3 className="font-black text-gray-800 text-sm uppercase">{p.name}</h3>
                                            <p className="text-2xl font-black text-indigo-600 mt-2 font-mono">₦{p.price.toLocaleString()}</p>
                                            <button onClick={() => addToCart(p)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition">Add to Cart</button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Order History</h3>
                                {orders.map(o => (
                                    <div key={o._id} className="bg-white p-4 rounded-xl shadow mb-2 flex justify-between border-l-4 border-indigo-300">
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase">{o.status}</p>
                                            <p className="font-bold text-sm uppercase">{o.items?.map(i => i.name).join(', ')}</p>
                                        </div>
                                        <span className="text-xs font-black bg-gray-100 px-2 py-1 rounded self-center font-mono text-indigo-600">₦{(o.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </section>
                        </div>
                        {/* Cart Sidebar */}
                        <aside className="bg-white p-6 rounded-2xl shadow-lg h-fit border-b-8 border-indigo-600 sticky top-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 border-b pb-2 tracking-widest">Active Cart</h3>
                            {cart.length === 0 ? <p className="text-center text-gray-400 italic text-[10px] py-10">Your cart is empty.</p> : (
                                <div className="space-y-4">
                                    {cart.map(i => <div key={i._id} className="flex justify-between text-xs font-bold border-b pb-2"><span>{i.qty}x {i.name}</span><span className="text-indigo-600 font-mono">₦{(i.price * i.qty).toLocaleString()}</span></div>)}
                                    <div className="pt-4">
                                        <p className="flex justify-between font-black text-sm uppercase"><span>Total</span><span className="font-mono text-indigo-600">₦{cart.reduce((s,i)=>s+(i.price*i.qty),0).toLocaleString()}</span></p>
                                        <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-3 rounded-xl font-black uppercase text-xs mt-4 shadow-lg active:scale-95 transition hover:bg-green-700">Checkout Now</button>
                                        <button onClick={() => setCart([])} className="w-full mt-2 text-[10px] text-red-500 font-bold uppercase hover:underline">Clear Cart</button>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Dashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
