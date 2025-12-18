import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}${isLogin ? '/login' : '/register'}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok) {
            if (isLogin) { localStorage.setItem('user', JSON.stringify(data.user)); onLogin(data.user); }
            else { setIsLogin(true); alert("Account Ready!"); }
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic">SwiftLogi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setFormData({...formData, role: e.target.value})}><option value="user">User</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold uppercase shadow-lg">Enter Dashboard</button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-[10px] font-bold uppercase text-indigo-600 underline">{isLogin ? "Register" : "Login"}</button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [userProducts, setUserProducts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeFolder, setActiveFolder] = useState('inventory');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [newProd, setNewProd] = useState({ name: '', price: '', location: '', image: '' });
    const fileInputRef = useRef(null);

    const fetchAll = useCallback(async () => {
        const [pRes, jRes, uRes] = await Promise.all([
            fetch(`${API_URL}/products`), fetch(`${API_URL}/jobs`), fetch(`${API_URL}/api/user/products/${user.id}`)
        ]);
        setProducts(await pRes.json());
        setJobs(await jRes.json());
        setUserProducts(await uRes.json());
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (p) => {
        setCart(prev => [...prev, { ...p, qty: 1 }]);
        alert(`${p.name} added to cart!`);
    };

    const updateJobStatus = async (jobId, status) => {
        await fetch(`${API_URL}/jobs/${jobId}/status`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, riderId: user.id })
        });
        fetchAll();
        alert(`Job ${status}`);
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
        <div className="min-h-screen flex bg-gray-100 font-sans">
            <aside className="w-72 bg-indigo-900 text-white flex flex-col p-6 space-y-8">
                <h1 className="text-3xl font-black italic uppercase italic">SwiftLogi</h1>
                <nav className="flex-grow space-y-2">
                    <button onClick={() => setActiveFolder('inventory')} className="flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm">📁 Dashboard</button>
                    <button onClick={() => setActiveFolder('marketplace')} className="flex items-center gap-3 w-full p-4 pl-10 rounded-xl font-bold text-xs opacity-60">🛒 Marketplace</button>
                    {user.role === 'rider' && <button onClick={() => setActiveFolder('rider')} className="flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm">🏍️ Rider Feed</button>}
                </nav>
                <button onClick={onLogout} className="bg-red-600 p-4 rounded-xl font-black text-xs uppercase shadow-lg">Logout</button>
            </aside>

            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex items-center justify-between px-10 border-b relative">
                    <input type="text" placeholder="Search..." className="w-full max-w-xl p-3 bg-gray-100 rounded-2xl outline-none" />
                    {/* CART ICON AT BLACK MARKER SPOT */}
                    <button onClick={() => setShowCart(true)} className="relative bg-white p-3 rounded-full border-2 border-indigo-500 ml-4 group">
                        <span className="text-2xl">🛒</span>
                        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{cart.length}</span>}
                    </button>
                </header>

                <div className="p-10 overflow-y-auto">
                    {activeFolder === 'rider' ? (
                        <section className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border-b-4 border-blue-500 flex justify-between items-center">
                                <h3 className="text-lg font-black text-blue-600 uppercase italic">STATUS: <span className="text-green-500">AVAILABLE</span></h3>
                                {/* REFRESH BUTTON RESTORED */}
                                <button onClick={fetchAll} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-black text-xs uppercase">Refresh Jobs 🔄</button>
                            </div>
                            {jobs.map(j => (
                                <div key={j._id} className="bg-white p-8 rounded-3xl shadow-md border-l-4 border-green-500 flex justify-between items-center">
                                    <div><p className="font-black text-xl uppercase italic">PACKAGE</p><p className="text-lg font-black text-green-600">Payout: ₦1,500</p></div>
                                    <div className="flex gap-3">
                                        {/* REJECT & ACCEPT BUTTONS CONNECTED */}
                                        <button onClick={() => updateJobStatus(j._id, 'rejected')} className="bg-red-100 text-red-600 px-8 py-3 rounded-2xl font-black uppercase text-xs">Reject</button>
                                        <button onClick={() => updateJobStatus(j._id, 'shipped')} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs shadow-xl">Accept Job</button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    ) : activeFolder === 'marketplace' ? (
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-8 rounded-3xl shadow border-t-4 border-indigo-500">
                                    <img src={p.image} className="w-full h-44 object-contain rounded-2xl mb-4 bg-gray-50" />
                                    <h3 className="font-black text-sm uppercase">{p.name}</h3>
                                    <p className="text-2xl font-black text-indigo-600 italic">₦{p.price.toLocaleString()}</p>
                                    <button onClick={() => addToCart(p)} className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Buy Now / Add To Cart</button>
                                </div>
                            ))}
                        </section>
                    ) : (
                        <section className="space-y-6">
                            <button onClick={() => setActiveFolder('upload')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg">+ UPLOAD ITEM</button>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userProducts.map(p => (
                                    <div key={p._id} className="bg-white p-6 rounded-3xl shadow-md border-t-4 border-green-500">
                                        <img src={p.image} className="w-full h-40 object-contain rounded-2xl mb-4 bg-gray-50" />
                                        <h4 className="font-black uppercase text-sm">{p.name}</h4>
                                        <p className="text-indigo-600 font-black text-lg font-mono">₦{p.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {showCart && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                        <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col">
                            <h3 className="text-2xl font-black text-indigo-900 uppercase border-b pb-6">Shopping Bag</h3>
                            <div className="flex-grow overflow-y-auto py-6 space-y-4">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border-l-4 border-indigo-500">
                                        <p className="font-black text-xs uppercase">{item.name}</p>
                                        <p className="font-black text-xs">₦{item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-6">
                                <p className="flex justify-between font-black text-xl mb-4"><span>Total</span><span>₦{cart.reduce((s,i)=>s+i.price,0).toLocaleString()}</span></p>
                                <button className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Pay Now</button>
                                <button onClick={() => setShowCart(false)} className="w-full mt-2 text-xs font-bold text-gray-400">Close</button>
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
