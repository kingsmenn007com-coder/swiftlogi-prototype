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
            else { setIsLogin(true); alert("Registered! Login Now."); }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic">SwiftLogi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}><option value="user">Buyer / Seller</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg">Enter Dashboard</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-[10px] font-bold uppercase text-indigo-600 underline">{isLogin ? "Register" : "Login"}</button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState("");
    const [newProd, setNewProd] = useState({ name: '', price: '', location: '' });

    const fetchAll = useCallback(async () => {
        const [pRes, jRes] = await Promise.all([fetch(`${API_URL}/products`), fetch(`${API_URL}/jobs`)]);
        setProducts(await pRes.json());
        setJobs(await jRes.json());
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProd, seller: user.id, sellerName: user.name })
        });
        if (res.ok) { alert("Item Uploaded Successfully!"); setActiveTab('dashboard'); fetchAll(); }
    };

    return (
        <div className="min-h-screen flex bg-gray-100 font-sans">
            {/* SIDEBAR NAVIGATION */}
            <aside className="w-72 bg-indigo-900 text-white flex flex-col p-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase italic">SwiftLogi</h1>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase mt-1">WELCOME, {user.name}</p>
                </div>
                <nav className="flex-grow space-y-2">
                    <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-sm ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-lg' : 'opacity-60 hover:bg-indigo-800'}`}>📁 Dashboard</button>
                    {user.role === 'user' && <button onClick={() => setActiveTab('upload')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-sm ${activeTab === 'upload' ? 'bg-indigo-600 shadow-lg' : 'opacity-60 hover:bg-indigo-800'}`}>📤 Upload Items</button>}
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl font-bold text-sm opacity-60 hover:bg-indigo-800">📍 Tracking</button>
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl font-bold text-sm opacity-60 hover:bg-indigo-800">⚙️ Settings</button>
                </nav>
                <button onClick={onLogout} className="bg-red-600 p-3 rounded-xl font-black uppercase text-xs shadow-lg">Logout</button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex items-center border-b">
                    <div className="relative w-full max-w-lg">
                        <input type="text" placeholder="Search products, prices, sellers..." className="w-full p-3 pl-12 bg-gray-100 rounded-2xl outline-none text-sm" onChange={e => setSearchTerm(e.target.value)} />
                        <span className="absolute left-4 top-3.5 opacity-30 text-lg">🔍</span>
                    </div>
                </header>

                <div className="p-10 overflow-y-auto space-y-10">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-indigo-500">
                        <h2 className="text-3xl font-black text-gray-800 uppercase italic">WELCOME, {user.name.toUpperCase()}</h2>
                    </div>

                    {activeTab === 'upload' ? (
                        /* UPLOAD STUDIO SECTION */
                        <section className="bg-white p-10 rounded-3xl shadow-lg border-t-8 border-green-500 max-w-2xl">
                            <h3 className="text-xl font-black uppercase text-indigo-800 mb-6">Inventory Upload Studio</h3>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="bg-gray-50 p-10 border-2 border-dashed rounded-3xl text-center text-gray-400 font-bold mb-4 italic">Drop Product Images Here (Placeholder)</div>
                                <input type="text" placeholder="Item Name" className="w-full p-4 border rounded-2xl" onChange={e => setNewProd({...newProd, name: e.target.value})} required />
                                <input type="number" placeholder="Price (₦)" className="w-full p-4 border rounded-2xl" onChange={e => setNewProd({...newProd, price: e.target.value})} required />
                                <input type="text" placeholder="Location (Address/City)" className="w-full p-4 border rounded-2xl" onChange={e => setNewProd({...newProd, location: e.target.value})} required />
                                <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Publish to Marketplace</button>
                            </form>
                        </section>
                    ) : (
                        user.role === 'rider' ? (
                            /* RESTORED RIDER FEED WITH REJECT BUTTON */
                            <section className="space-y-6">
                                <div className="bg-white p-6 rounded-3xl border-b-4 border-blue-500 shadow-sm"><h3 className="text-lg font-black text-blue-600 uppercase italic">RIDER STATUS: <span className="text-green-500">AVAILABLE</span></h3></div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Delivery Jobs</h3>
                                {jobs.map(j => (
                                    <div key={j._id} className="bg-white p-8 rounded-3xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-tighter italic">ID: {j._id.substring(0,8)}</p>
                                            <p className="font-black text-gray-800 text-xl uppercase italic">PACKAGE</p>
                                            <p className="text-sm font-bold text-gray-500 mt-2 italic">📍 Pickup: Shop Admin | 🏠 Dropoff: Test User</p>
                                            <p className="text-lg font-black text-green-600 mt-2 italic">Payout: ₦1,500</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => alert("Job Rejected")} className="bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-sm">Reject</button>
                                            <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition">Accept Job</button>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        ) : (
                            /* MARKETPLACE VIEW */
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                    <div key={p._id} className="bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition border-t-4 border-indigo-500">
                                        <div className="w-full h-44 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center italic text-gray-300 font-bold">Product Image</div>
                                        <h3 className="font-black text-gray-800 text-sm uppercase mb-1">{p.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-black mb-4 uppercase">Seller: {p.sellerName || 'Verified'}</p>
                                        <p className="text-2xl font-black text-indigo-600 italic">₦{p.price.toLocaleString()}</p>
                                        <button className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition">Buy Now / Add To Cart</button>
                                    </div>
                                ))}
                            </section>
                        )
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
