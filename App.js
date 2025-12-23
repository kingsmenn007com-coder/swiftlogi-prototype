import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

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
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase tracking-tighter">SwiftLogi</h1>
                {msg.text && <p className={`text-center p-2 mb-4 text-xs font-bold ${msg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{msg.text}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">User (Buy/Sell Items)</option>
                        <option value="rider">Swift Rider (Deliveries)</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg hover:bg-indigo-700">
                        {isLogin ? 'Sign In' : 'Join Now'}
                    </button>
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
    const [cart, setCart] = useState([]);
    const [view, setView] = useState('marketplace');

    const fetchAll = useCallback(async () => {
        if (user.role === 'user') {
            const [pRes, oRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/user/orders/${user.id}`)
            ]);
            setProducts(await pRes.json());
            setOrders(await oRes.json());
        } else {
            const jRes = await fetch(`${API_URL}/jobs`);
            setJobs(await jRes.json());
        }
    }, [user.id, user.role]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (p) => {
        setCart(prev => {
            const exists = prev.find(item => item.productId === p._id);
            if (exists) return prev.map(item => item.productId === p._id ? {...item, qty: item.qty + 1} : item);
            return [...prev, { productId: p._id, name: p.name, price: p.price, qty: 1 }];
        });
    };

    const handleCheckout = async () => {
        const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, buyerId: user.id, totalAmount: total })
        });
        if (res.ok) {
            alert("Order Placed Successfully!");
            setCart([]);
            fetchAll();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm border-b">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-black text-indigo-700 italic uppercase">SwiftLogi</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase">{user.role}</span>
                        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-500">
                    <h2 className="text-xl font-black text-gray-800 tracking-tighter">WELCOME, {user.name.toUpperCase()}</h2>
                </div>

                {user.role === 'rider' ? (
                    <section className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Available Jobs</h3>
                            {jobs.map(j => (
                                <div key={j._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase font-mono">ID: {j._id.substring(18)}</p>
                                        <p className="font-bold text-gray-800 uppercase text-xs">{j.items?.length || 0} Items for delivery</p>
                                        <p className="text-sm font-black text-green-600 mt-2 font-mono">Payout: ₦2,500</p>
                                    </div>
                                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black uppercase text-xs">Accept</button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-200 rounded-2xl h-[400px] flex items-center justify-center border-4 border-white shadow-inner relative overflow-hidden">
                             <div className="absolute top-4 left-4 bg-white p-2 rounded shadow font-bold text-[10px] uppercase z-10">Google Map Live</div>
                             <p className="text-gray-500 font-bold italic">Map Interface Active</p>
                        </div>
                    </section>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex gap-4 border-b pb-2">
                                <button onClick={() => setView('marketplace')} className={`text-xs font-black uppercase ${view === 'marketplace' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}>Marketplace</button>
                                <button onClick={() => setView('history')} className={`text-xs font-black uppercase ${view === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}>My Orders</button>
                            </div>

                            {view === 'marketplace' ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <div key={p._id} className="bg-white p-6 rounded-2xl shadow border-t-4 border-indigo-500">
                                            <h3 className="font-black text-gray-800 text-sm uppercase">{p.name}</h3>
                                            <p className="text-2xl font-black text-indigo-600 mt-2">₦{p.price.toLocaleString()}</p>
                                            <button onClick={() => addToCart(p)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-black uppercase text-[10px]">Add to Cart</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {orders.map(o => (
                                        <div key={o._id} className="bg-white p-4 rounded-xl shadow border-l-4 border-indigo-300 flex justify-between">
                                            <div>
                                                <p className="font-bold text-xs uppercase font-mono">Order #{o._id.substring(18)}</p>
                                                <p className="text-[10px] font-black text-indigo-500 uppercase">{o.status}</p>
                                            </div>
                                            <span className="text-xs font-black self-center">₦{o.totalAmount?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <aside className="bg-white p-6 rounded-2xl shadow-lg h-fit border-b-8 border-indigo-600">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 border-b pb-2 tracking-widest">Active Cart</h3>
                            {cart.length === 0 ? <p className="text-center text-gray-400 italic text-[10px] py-10 uppercase font-black">Cart Empty</p> : (
                                <div className="space-y-4">
                                    {cart.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-xs font-bold border-b pb-2">
                                            <span>{i.qty}x {i.name}</span>
                                            <span className="text-indigo-600 font-mono">₦{(i.price * i.qty).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 space-y-2">
                                        <p className="flex justify-between font-black text-sm uppercase"><span>Total</span><span>₦{cart.reduce((s,i)=>s+(i.price*i.qty),0).toLocaleString()}</span></p>
                                        <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">Pay & Buy Now</button>
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
