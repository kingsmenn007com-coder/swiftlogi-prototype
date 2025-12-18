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
            else { setIsLogin(true); alert("Account Created! Login Now."); }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic tracking-tighter">SwiftLogi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">User (Buy/Sell)</option><option value="rider">Rider</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg">Enter Dashboard</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-[10px] font-bold uppercase text-indigo-600 underline tracking-widest">{isLogin ? "Register" : "Login"}</button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [userProducts, setUserProducts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeFolder, setActiveFolder] = useState('marketplace');
    const [searchTerm, setSearchTerm] = useState("");
    const [newProd, setNewProd] = useState({ name: '', price: '', location: '' });

    const fetchAll = useCallback(async () => {
        const [pRes, upRes, jRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/api/user/products/${user.id}`),
            fetch(`${API_URL}/jobs`)
        ]);
        setProducts(await pRes.json());
        if (upRes.ok) setUserProducts(await upRes.json());
        setJobs(await jRes.json());
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProd, seller: user.id, sellerName: user.name })
        });
        if (res.ok) { alert("Successfully Uploaded to Your Dashboard!"); fetchAll(); setActiveFolder('dashboard'); }
    };

    return (
        <div className="min-h-screen flex bg-gray-100 font-sans">
            {/* SIDEBAR NAVIGATION (Folder Style) */}
            <aside className="w-72 bg-indigo-900 text-white flex flex-col p-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase italic tracking-tighter">SwiftLogi</h1>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase mt-1 tracking-widest">WELCOME, {user.name}</p>
                </div>
                <nav className="flex-grow space-y-2">
                    <button onClick={() => setActiveFolder('marketplace')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'marketplace' ? 'bg-indigo-600' : 'opacity-60 hover:bg-indigo-800'}`}>🛒 Marketplace</button>
                    <button onClick={() => setActiveFolder('dashboard')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'dashboard' ? 'bg-indigo-600' : 'opacity-60 hover:bg-indigo-800'}`}>📁 Dashboard (Inventory)</button>
                    {user.role === 'rider' && <button onClick={() => setActiveFolder('rider')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'rider' ? 'bg-indigo-600' : 'opacity-60 hover:bg-indigo-800'}`}>🏍️ Rider Feed</button>}
                    <button className="flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm opacity-60 hover:bg-indigo-800">📍 Tracking</button>
                    <button className="flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm opacity-60 hover:bg-indigo-800">⚙️ Settings</button>
                </nav>
                <button onClick={onLogout} className="bg-red-600 p-4 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition">Logout</button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex items-center border-b px-10">
                    <div className="relative w-full max-w-xl">
                        <input type="text" placeholder="Search products, prices, sellers..." className="w-full p-3 pl-12 bg-gray-100 rounded-2xl outline-none text-sm font-medium" onChange={e => setSearchTerm(e.target.value)} />
                        <span className="absolute left-4 top-3.5 opacity-30 text-lg">🔍</span>
                    </div>
                </header>

                <div className="p-10 overflow-y-auto space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-indigo-500">
                        <h2 className="text-2xl font-black text-gray-800 uppercase italic">WELCOME, {user.name.toUpperCase()}</h2>
                    </div>

                    {activeFolder === 'dashboard' ? (
                        /* DASHBOARD / PERSONAL INVENTORY FOLDER */
                        <section className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                                <h3 className="text-xl font-black uppercase text-indigo-800 tracking-tighter">Your Personal Inventory</h3>
                                <button onClick={() => setActiveFolder('upload')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg">+ UPLOAD NEW ITEM</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userProducts.length === 0 ? <p className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed italic text-gray-400">Your inventory is empty. Upload an item to see it here.</p> : userProducts.map(p => (
                                    <div key={p._id} className="bg-white p-6 rounded-3xl shadow-md border-t-4 border-green-500">
                                        <div className="w-full h-32 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center font-bold text-gray-300 italic">Inventory Photo</div>
                                        <h4 className="font-black uppercase text-sm text-gray-800">{p.name}</h4>
                                        <p className="text-indigo-600 font-black text-lg">₦{p.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : activeFolder === 'upload' ? (
                        /* UPLOAD ITEM FOLDER */
                        <section className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-green-500 max-w-2xl mx-auto">
                            <h3 className="text-xl font-black uppercase text-indigo-800 mb-6 tracking-tighter">Upload Item to Your Dashboard</h3>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <input type="text" placeholder="Product Name" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400" onChange={e => setNewProd({...newProd, name: e.target.value})} required />
                                <input type="number" placeholder="Price (₦)" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400" onChange={e => setNewProd({...newProd, price: e.target.value})} required />
                                <input type="text" placeholder="Pickup Address / City" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400" onChange={e => setNewProd({...newProd, location: e.target.value})} required />
                                <button type="submit" className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition">PUBLISH TO MY DASHBOARD</button>
                            </form>
                        </section>
                    ) : activeFolder === 'rider' ? (
                        /* RIDER FEED WITH REJECT BUTTON */
                        <section className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border-b-4 border-blue-500 shadow-sm"><h3 className="text-lg font-black text-blue-600 uppercase italic">RIDER STATUS: <span className="text-green-500">AVAILABLE</span></h3></div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Delivery Jobs</h3>
                            {jobs.map(j => (
                                <div key={j._id} className="bg-white p-8 rounded-3xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-tighter">ORDER ID: {j._id.substring(0,8)}</p>
                                        <p className="font-black text-gray-800 text-xl uppercase italic">PACKAGE</p>
                                        <p className="text-sm font-bold text-gray-500 mt-2 italic">📍 Pickup: {j.items?.[0]?.location || 'Shop Admin'} | 🏠 Dropoff: Client Address</p>
                                        <p className="text-lg font-black text-green-600 mt-2 italic tracking-tighter">Payout: ₦1,500</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => alert("Job Rejected Successfully")} className="bg-red-100 text-red-600 px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-sm hover:bg-red-200 transition">Reject</button>
                                        <button onClick={() => alert("Job Accepted!")} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition">Accept Job</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    ) : (
                        /* GLOBAL MARKETPLACE FOLDER */
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <div key={p._id} className="bg-white p-8 rounded-3xl shadow hover:shadow-2xl transition border-t-4 border-indigo-500">
                                    <div className="w-full h-44 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center font-bold text-gray-300 italic text-xs">Product Image</div>
                                    <h3 className="font-black text-gray-800 text-sm uppercase mb-1 tracking-tight">{p.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-black mb-4 uppercase tracking-widest">Seller: {p.sellerName || 'Verified User'}</p>
                                    <p className="text-2xl font-black text-indigo-600 italic tracking-tighter">₦{p.price.toLocaleString()}</p>
                                    <button className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition">Buy Now / Add To Cart</button>
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
