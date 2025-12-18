import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok) {
            if (isLogin) { localStorage.setItem('user', JSON.stringify(data.user)); onLogin(data.user); }
            else { setIsLogin(true); alert("Account Ready! Login Now."); }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic tracking-tighter">SwiftLogi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg outline-none font-bold" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg outline-none font-bold" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg outline-none font-bold" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase tracking-widest">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-black uppercase text-xs" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">User (Buy/Sell)</option><option value="rider">Swift Rider</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-black uppercase shadow-lg tracking-widest">Enter Dashboard</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-[10px] font-bold uppercase text-indigo-600 underline tracking-widest">{isLogin ? "Need Account? Register" : "Have Account? Login"}</button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [userProducts, setUserProducts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeFolder, setActiveFolder] = useState(user.role === 'rider' ? 'rider' : 'inventory');
    const [searchTerm, setSearchTerm] = useState("");
    const [newProd, setNewProd] = useState({ name: '', price: '', location: '', image: '' });
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const fileInputRef = useRef(null);

    const fetchAll = useCallback(async () => {
        const [pRes, jRes, uRes] = await Promise.all([
            fetch(`${API_URL}/products`), fetch(`${API_URL}/jobs`), fetch(`${API_URL}/api/user/products/${user.id}`)
        ]);
        setProducts(await pRes.json());
        setJobs(await jRes.json());
        if (uRes.ok) setUserProducts(await uRes.json());
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (p) => {
        setCart(prev => {
            const exists = prev.find(item => item._id === p._id);
            if (exists) return prev.map(item => item._id === p._id ? {...item, qty: item.qty + 1} : item);
            return [...prev, { ...p, qty: 1 }];
        });
    };

    const updateJobStatus = async (jobId, status) => {
        await fetch(`${API_URL}/jobs/${jobId}/status`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, riderId: user.id })
        });
        fetchAll();
    };

    const handleCheckout = async () => {
        const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyer: user.id, items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.qty })), totalPrice: total })
        });
        if (res.ok) { alert("Checkout Success! Pay via link..."); setCart([]); setShowCart(false); fetchAll(); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewProd({ ...newProd, image: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/products`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newProd, seller: user.id, sellerName: user.name })
        });
        setNewProd({name:'', price:'', location:'', image:''});
        fetchAll(); setActiveFolder('inventory');
    };

    return (
        <div className="min-h-screen flex bg-gray-100 font-sans overflow-hidden">
            {/* SIDEBAR - Restored Folders */}
            <aside className="w-72 bg-indigo-900 text-white flex flex-col p-6 space-y-8 h-screen sticky top-0">
                <h1 className="text-3xl font-black italic uppercase italic tracking-tighter">SwiftLogi</h1>
                <nav className="flex-grow space-y-2">
                    {user.role === 'user' ? (
                        <>
                            <button onClick={() => setActiveFolder('inventory')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'inventory' ? 'bg-indigo-600 shadow-lg' : 'opacity-60 hover:bg-indigo-800 transition'}`}>📁 Dashboard (Inventory)</button>
                            <button onClick={() => setActiveFolder('marketplace')} className={`flex items-center gap-3 w-full p-4 pl-10 rounded-xl font-bold text-xs ${activeFolder === 'marketplace' ? 'bg-indigo-600 shadow-lg' : 'opacity-60 hover:bg-indigo-800 transition'}`}>🛒 Marketplace</button>
                        </>
                    ) : (
                        <button onClick={() => setActiveFolder('rider')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'rider' ? 'bg-indigo-600 shadow-lg' : 'opacity-60 hover:bg-indigo-800 transition'}`}>🏍️ Rider Feed</button>
                    )}
                    <button className="flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm opacity-60">📍 Tracking</button>
                    <button className="flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm opacity-60">⚙️ Settings</button>
                </nav>
                <button onClick={onLogout} className="bg-red-600 p-4 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition">Logout</button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-grow flex flex-col overflow-hidden h-screen">
                <header className="bg-white p-6 shadow-sm flex items-center justify-between px-10 border-b relative">
                    <div className="relative w-full max-w-xl">
                        <input type="text" placeholder="Search for products (images, prices, sellers)..." className="w-full p-3 pl-12 bg-gray-100 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-300" onChange={e => setSearchTerm(e.target.value)} />
                        <span className="absolute left-4 top-3.5 opacity-30 text-lg">🔍</span>
                    </div>

                    {/* CART ICON - Black Marker Position */}
                    {user.role === 'user' && (
                        <button onClick={() => setShowCart(true)} className="relative bg-white p-3 rounded-full border-2 border-indigo-500 ml-4 group shadow-sm transition hover:shadow-md">
                            <span className="text-2xl group-hover:scale-110 transition inline-block">🛒</span>
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white animate-bounce">{cart.length}</span>}
                        </button>
                    )}
                </header>

                <div className="p-10 overflow-y-auto flex-grow space-y-8 bg-gray-50">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-indigo-500">
                        <h2 className="text-2xl font-black text-gray-800 uppercase italic">WELCOME, {user.name.toUpperCase()}</h2>
                    </div>

                    {activeFolder === 'rider' ? (
                        /* RIDER FEED - Restored Refresh & Functional Buttons */
                        <section className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border-b-4 border-blue-500 flex justify-between items-center shadow-sm">
                                <h3 className="text-lg font-black text-blue-600 uppercase italic">RIDER STATUS: <span className="text-green-500">AVAILABLE</span></h3>
                                <button onClick={fetchAll} className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-200 transition">Refresh Jobs 🔄</button>
                            </div>
                            {jobs.length === 0 ? <p className="text-center italic text-gray-400 p-20 font-bold bg-white rounded-3xl border-2 border-dashed">No active jobs. Refreshing...</p> : jobs.map(j => (
                                <div key={j._id} className="bg-white p-8 rounded-3xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase italic">ORDER ID: {j._id.substring(0,8)}</p>
                                        <p className="font-black text-gray-800 text-xl uppercase italic">Logistics Package</p>
                                        <p className="text-sm font-bold text-gray-500 mt-2 italic font-black uppercase">📍 Pickup: Shop Admin | 🏠 Dropoff: Client</p>
                                        <p className="text-lg font-black text-green-600 mt-2 italic">Payout: ₦1,500</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => updateJobStatus(j._id, 'rejected')} className="bg-red-100 text-red-600 px-8 py-3 rounded-2xl font-black uppercase text-xs transition hover:bg-red-200">Reject</button>
                                        <button onClick={() => updateJobStatus(j._id, 'shipped')} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition">Accept Job</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    ) : activeFolder === 'marketplace' ? (
                        /* MARKETPLACE - Restored */
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <div key={p._id} className="bg-white p-8 rounded-3xl shadow hover:shadow-2xl transition border-t-4 border-indigo-500">
                                    <img src={p.image || "https://via.placeholder.com/200"} className="w-full h-48 object-contain rounded-2xl mb-4 bg-gray-50" alt={p.name} />
                                    <h3 className="font-black text-gray-800 text-sm uppercase mb-1">{p.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-black mb-4 uppercase">Seller: {p.sellerName || 'Verified'}</p>
                                    <p className="text-2xl font-black text-indigo-600 italic tracking-tighter">₦{p.price.toLocaleString()}</p>
                                    <button onClick={() => addToCart(p)} className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition active:scale-95">Add To Cart / Buy Now</button>
                                </div>
                            ))}
                        </section>
                    ) : activeFolder === 'inventory' ? (
                        /* DASHBOARD INVENTORY - Restored */
                        <section className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                                <h3 className="text-xl font-black uppercase text-indigo-800 italic font-black">PERSONAL INVENTORY</h3>
                                <button onClick={() => setActiveFolder('upload')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-green-700 transition">+ UPLOAD NEW ITEM</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userProducts.length === 0 ? <button onClick={() => setActiveFolder('upload')} className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold italic hover:bg-gray-50 transition uppercase">Inventory empty. click to upload your item.</button> : userProducts.map(p => (
                                    <div key={p._id} className="bg-white p-6 rounded-3xl shadow-md border-t-4 border-green-500">
                                        <img src={p.image} className="w-full h-40 object-contain rounded-2xl mb-4 bg-gray-50" alt={p.name} />
                                        <h4 className="font-black uppercase text-sm">{p.name}</h4>
                                        <p className="text-indigo-600 font-black text-lg">₦{p.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        /* UPLOAD FOLDER - Restored */
                        <section className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-green-500 max-w-2xl mx-auto">
                            <h3 className="text-xl font-black uppercase text-indigo-800 mb-6 italic font-black text-center">UPLOAD ITEM TO DASHBOARD</h3>
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                            <div onClick={() => fileInputRef.current.click()} className="bg-gray-50 p-10 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400 font-bold italic cursor-pointer hover:bg-gray-100 transition overflow-hidden">
                                {newProd.image ? <img src={newProd.image} className="max-h-40 mx-auto rounded-xl shadow-md" alt="Preview" /> : "Select Product Image From Device Folder"}
                            </div>
                            {newProd.image && (
                                <form onSubmit={handleUpload} className="mt-6 space-y-4">
                                    <input type="text" placeholder="Item Name" className="w-full p-4 border rounded-2xl outline-none font-bold" onChange={e => setNewProd({...newProd, name: e.target.value})} required />
                                    <input type="number" placeholder="Price (₦)" className="w-full p-4 border rounded-2xl outline-none font-bold" onChange={e => setNewProd({...newProd, price: e.target.value})} required />
                                    <input type="text" placeholder="Pickup Address" className="w-full p-4 border rounded-2xl outline-none font-bold" onChange={e => setNewProd({...newProd, location: e.target.value})} required />
                                    <button type="submit" className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition">PUBLISH ITEM</button>
                                </form>
                            )}
                        </section>
                    )}
                </div>

                {/* SHOPPING BAG SIDEBAR - Final perfected view */}
                {showCart && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                        <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
                            <h3 className="text-2xl font-black text-indigo-900 uppercase border-b pb-6 italic tracking-tighter">SHOPPING BAG</h3>
                            <div className="flex-grow overflow-y-auto py-6 space-y-4">
                                {cart.length === 0 ? <p className="text-center italic text-gray-400 mt-20 font-black">Bag is empty. Pick items from Marketplace.</p> : cart.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border-l-4 border-indigo-500 shadow-sm transition hover:shadow-md">
                                        <p className="font-black text-xs uppercase text-gray-800">{item.name} (x{item.qty})</p>
                                        <p className="font-black text-sm italic">₦{(item.price * item.qty).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-6">
                                <div className="flex justify-between font-black text-2xl mb-6 uppercase tracking-tighter">
                                    <span>Total Payout</span>
                                    <span className="text-indigo-600 font-mono">₦{cart.reduce((s,i)=>s+(i.price*i.qty),0).toLocaleString()}</span>
                                </div>
                                <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition hover:bg-green-700">PAY NOW</button>
                                <button onClick={() => setShowCart(false)} className="w-full mt-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:underline transition">Close Shopping Bag</button>
                            </div>
                        </div>
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
