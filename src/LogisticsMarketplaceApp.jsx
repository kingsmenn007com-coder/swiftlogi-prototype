import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

// --- Specialized Auth Component (Preserving Password Toggle) ---
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
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">User (Buy/Sell)</option>
                        <option value="rider">Swift Rider (Deliveries)</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg">Enter App</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-xs font-bold uppercase text-indigo-600 underline">{isLogin ? "Register" : "Login"}</button>
            </div>
        </div>
    );
};

// --- Main Dashboard (Unified Search, Cart, and Rider Logic) ---
const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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

    const addToCart = (p) => {
        setCart(prev => [...prev, { ...p, qty: 1 }]);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* SIDEBAR (From Sample Image) */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col p-6 hidden md:flex">
                <h1 className="text-2xl font-black italic mb-2 uppercase">SwiftLogi</h1>
                <p className="text-[10px] font-bold text-indigo-300 uppercase mb-8">Welcome, {user.name}</p>
                <nav className="space-y-4 flex-grow">
                    <button className="flex items-center gap-3 w-full p-2 bg-indigo-800 rounded-lg text-sm font-bold"><span className="text-lg">📁</span> Dashboard</button>
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-indigo-800 rounded-lg text-sm font-bold opacity-60"><span className="text-lg">🏍️</span> Rider Feed</button>
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-indigo-800 rounded-lg text-sm font-bold opacity-60"><span className="text-lg">📍</span> Tracking</button>
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-indigo-800 rounded-lg text-sm font-bold opacity-60"><span className="text-lg">⚙️</span> Settings</button>
                </nav>
                <button onClick={onLogout} className="bg-red-600 p-2 rounded-lg font-bold text-xs uppercase shadow-lg">Logout</button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-grow flex flex-col">
                <header className="bg-white p-4 shadow-sm flex justify-between items-center px-8 border-b">
                    <div className="relative w-full max-w-xl">
                        <input 
                            type="text" 
                            placeholder="Search for products (images, prices, sellers)..." 
                            className="w-full p-3 pl-10 bg-gray-100 border-none rounded-xl text-sm outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-3.5 opacity-30">🔍</span>
                    </div>
                    {user.role === 'user' && (
                        <div className="ml-4 flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Cart ({cart.length})</p>
                                <p className="text-xs font-black text-indigo-600">₦{cart.reduce((s,i)=>s+i.price,0).toLocaleString()}</p>
                            </div>
                            <button className="bg-indigo-600 text-white p-2 rounded-lg text-xs font-bold uppercase shadow">🛒 CART</button>
                        </div>
                    )}
                </header>

                <div className="p-8 space-y-8 overflow-y-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-500">
                        <h2 className="text-2xl font-black text-gray-800 uppercase italic">WELCOME, {user.name.toUpperCase()}</h2>
                    </div>

                    {user.role === 'rider' ? (
                        /* RESTORED INDEPENDENT RIDER DASHBOARD */
                        <section className="space-y-4">
                            <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-500">
                                <h3 className="text-lg font-black text-blue-600 uppercase italic">Rider Status: <span className="text-green-500">Available</span></h3>
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mt-6">Available Delivery Jobs</h3>
                            {jobs.map(j => (
                                <div key={j._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mb-1">ID: {j._id.substring(0,8)}</p>
                                        <p className="font-black text-gray-800 uppercase text-lg">{j.items?.[0]?.name || 'Package'}</p>
                                        <div className="text-[11px] text-gray-500 font-bold mt-2">📍 Pickup: Shop Admin | 🏠 Dropoff: Test User</div>
                                        <p className="text-sm font-black text-green-600 mt-2 italic">Payout: ₦1,500</p>
                                    </div>
                                    <button onClick={() => alert("Job Accepted! Mapping Loading...")} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition">Accept Job</button>
                                </div>
                            ))}
                        </section>
                    ) : (
                        /* RESTORED BUYER/SELLER MARKETPLACE WITH SEARCH */
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition border-t-4 border-indigo-500">
                                    <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center italic text-gray-400 text-xs">Product Image</div>
                                    <h3 className="font-black text-gray-800 text-sm uppercase mb-1">{p.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase">Seller: {p.sellerName || 'Verified'}</p>
                                    <p className="text-2xl font-black text-indigo-600">₦{p.price.toLocaleString()}</p>
                                    <button onClick={() => addToCart(p)} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition">Buy Now / Add To Cart</button>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Dashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
