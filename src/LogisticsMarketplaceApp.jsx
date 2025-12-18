import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok) {
            if (isLogin) { localStorage.setItem('user', JSON.stringify(data.user)); onLogin(data.user); }
            else { setIsLogin(true); alert("Registered! Please Login."); }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi V10</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-bold text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">Buyer / Seller</option><option value="rider">Rider</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-black uppercase shadow-lg">Enter App</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-xs font-bold uppercase text-indigo-600 underline">{isLogin ? "Register" : "Login"}</button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [cart, setCart] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [newProd, setNewProd] = useState({ name: '', price: '', location: '' });

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

    const handleUpload = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProd, seller: user.id, sellerName: user.name })
        });
        if (res.ok) { setShowUpload(false); fetchAll(); alert("Product Live!"); }
    };

    const handleCheckout = async () => {
        const totalPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0);
        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerId: user.id, items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.qty })), totalPrice })
        });
        setCart([]); fetchAll(); alert("Ordered!");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 shadow-sm flex justify-between items-center max-w-5xl mx-auto border-b">
                <h1 className="text-2xl font-black text-indigo-700 italic uppercase">SwiftLogi</h1>
                <div className="flex items-center gap-4">
                    {user.role === 'user' && <button onClick={() => setShowUpload(true)} className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase shadow">+ Sell Item</button>}
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase shadow">Logout</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-500 mb-6">
                    <h2 className="text-xl font-black uppercase">Welcome, {user.name}</h2>
                </div>

                {user.role === 'rider' ? (
                    <section className="space-y-4">
                        <div className="flex justify-between items-center bg-indigo-100 p-4 rounded-xl">
                            <h3 className="font-black text-indigo-700 uppercase text-xs tracking-widest">Job Feed</h3>
                            <button onClick={fetchAll} className="text-[10px] font-black bg-white px-3 py-1 rounded shadow">Refresh 🔄</button>
                        </div>
                        {jobs.map(j => (
                            <div key={j._id} className="bg-white p-5 rounded-2xl shadow-md flex justify-between items-center border-l-4 border-green-500">
                                <div><p className="font-black uppercase text-sm">{j.items?.[0]?.name}</p><p className="text-xs text-gray-400">Payout: ₦1,500</p></div>
                                <div className="flex gap-2">
                                    <button className="bg-red-100 text-red-600 px-3 py-1 rounded font-bold text-[10px]">REJECT</button>
                                    <button className="bg-indigo-600 text-white px-4 py-1 rounded font-bold text-[10px]">ACCEPT</button>
                                </div>
                            </div>
                        ))}
                    </section>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {products.map(p => (
                            <div key={p._id} className="bg-white p-6 rounded-2xl shadow border-t-4 border-indigo-500">
                                <h3 className="font-black text-gray-800 uppercase text-sm">{p.name}</h3>
                                <p className="text-2xl font-black text-indigo-600">₦{p.price.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">📍 {p.location || 'Nigeria'}</p>
                                <button onClick={() => setCart([...cart, {...p, qty: 1}])} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-black text-[10px] uppercase">Add to Cart</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Drawer & Upload Modal */}
            {cart.length > 0 && <div className="fixed bottom-0 left-0 right-0 bg-indigo-700 text-white p-4 flex justify-between items-center shadow-2xl">
                <p className="font-black text-xs uppercase">{cart.length} Items in Cart</p>
                <button onClick={handleCheckout} className="bg-white text-indigo-700 px-6 py-2 rounded-full font-black text-xs uppercase">Checkout (₦{cart.reduce((s,i)=>s+i.price,0).toLocaleString()})</button>
            </div>}

            {showUpload && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                <form onSubmit={handleUpload} className="bg-white p-8 rounded-2xl w-full max-w-sm space-y-4">
                    <h2 className="text-xl font-black uppercase text-indigo-700">Upload Product</h2>
                    <input type="text" placeholder="Item Name" className="w-full p-3 border rounded" onChange={e=>setNewProd({...newProd, name:e.target.value})} required />
                    <input type="number" placeholder="Price (₦)" className="w-full p-3 border rounded" onChange={e=>setNewProd({...newProd, price:e.target.value})} required />
                    <input type="text" placeholder="Location (State/City)" className="w-full p-3 border rounded" onChange={e=>setNewProd({...newProd, location:e.target.value})} required />
                    <div className="flex gap-2">
                        <button type="button" onClick={()=>setShowUpload(false)} className="w-1/2 bg-gray-200 p-3 rounded font-bold">Cancel</button>
                        <button type="submit" className="w-1/2 bg-indigo-600 text-white p-3 rounded font-black">Publish</button>
                    </div>
                </form>
            </div>}
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Dashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
