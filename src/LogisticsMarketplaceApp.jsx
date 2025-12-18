import React, { useState, useEffect, useCallback, useRef } from 'react';

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
            else { setIsLogin(true); alert("Account Ready! Login Now."); }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 uppercase italic tracking-tighter italic">SwiftLogi</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded-lg outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-500 uppercase">{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                    {!isLogin && <select className="w-full p-3 border rounded-lg bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}><option value="user">User</option><option value="rider">Rider</option></select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-black uppercase shadow-lg">Enter App</button>
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
    const [activeFolder, setActiveFolder] = useState('inventory');
    const [searchTerm, setSearchTerm] = useState("");
    const [newProd, setNewProd] = useState({ name: '', price: '', location: '', image: '' });
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const fileInputRef = useRef(null);

    const fetchAll = useCallback(async () => {
        const [pRes, upRes, jRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/user/products/${user.id}`),
            fetch(`${API_URL}/jobs`)
        ]);
        setProducts(await pRes.json());
        if (upRes.ok) setUserProducts(await upRes.json());
        setJobs(await jRes.json());
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // CORE FIX: Add to Cart Logic
    const addToCart = (p) => {
        setCart(prev => {
            const exists = prev.find(item => item._id === p._id);
            if (exists) return prev.map(item => item._id === p._id ? {...item, qty: item.qty + 1} : item);
            return [...prev, { ...p, qty: 1 }];
        });
    };

    const handleCheckout = async () => {
        const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyer: user.id,
                items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.qty })),
                totalPrice: total
            })
        });
        if (res.ok) { alert("Successfully ordered!"); setCart([]); setShowCart(false); fetchAll(); }
    };

    return (
        <div className="min-h-screen flex bg-gray-100 font-sans">
            <aside className="w-72 bg-indigo-900 text-white flex flex-col p-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase italic tracking-tighter">SwiftLogi</h1>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase mt-1 tracking-widest">WELCOME, {user.name}</p>
                </div>
                <nav className="flex-grow space-y-2">
                    <button onClick={() => setActiveFolder('inventory')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'inventory' ? 'bg-indigo-600' : 'opacity-60'}`}>📁 Dashboard</button>
                    <button onClick={() => setActiveFolder('marketplace')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'marketplace' ? 'bg-indigo-600' : 'opacity-60'}`}>🛒 Marketplace</button>
                    {user.role === 'rider' && <button onClick={() => setActiveFolder('rider')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold text-sm ${activeFolder === 'rider' ? 'bg-indigo-600' : 'opacity-60'}`}>🏍️ Rider Feed</button>}
                </nav>
                <button onClick={onLogout} className="bg-red-600 p-4 rounded-xl font-black uppercase text-xs">Logout</button>
            </aside>

            <main className="flex-grow flex flex-col overflow-hidden">
                <header className="bg-white p-6 shadow-sm flex items-center justify-between px-10 border-b">
                    <div className="relative w-full max-w-xl">
                        <input type="text" placeholder="Search..." className="w-full p-3 pl-12 bg-gray-100 rounded-2xl outline-none" onChange={e => setSearchTerm(e.target.value)} />
                        <span className="absolute left-4 top-3.5 opacity-30 text-lg">🔍</span>
                    </div>

                    {/* BLACK MARKER FIX: Cart Icon at Top Far Right */}
                    <div className="flex items-center">
                        {user.role === 'user' && (
                            <button onClick={() => setShowCart(true)} className="relative bg-white p-3 rounded-full border-2 border-indigo-500 ml-4 hover:bg-indigo-50">
                                <span className="text-2xl">🛒</span>
                                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{cart.length}</span>}
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-10 overflow-y-auto">
                    {activeFolder === 'marketplace' ? (
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <div key={p._id} className="bg-white p-8 rounded-3xl shadow-md border-t-4 border-indigo-500">
                                    <img src={p.image} className="w-full h-44 object-contain rounded-2xl mb-4 bg-gray-50" />
                                    <h3 className="font-black text-gray-800 text-sm uppercase italic">{p.name}</h3>
                                    <p className="text-2xl font-black text-indigo-600 italic">₦{p.price.toLocaleString()}</p>
                                    {/* CORE FIX: Button connected to addToCart */}
                                    <button onClick={() => addToCart(p)} className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl">Buy Now / Add To Cart</button>
                                </div>
                            ))}
                        </section>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-indigo-500">
                            <h2 className="text-2xl font-black text-gray-800 uppercase italic">WELCOME, {user.name.toUpperCase()}</h2>
                        </div>
                    )}
                </div>

                {/* CART DRAWER FIX */}
                {showCart && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                        <div className="w-full max-w-md bg-white h-full p-8 flex flex-col shadow-2xl">
                            <div className="flex justify-between items-center border-b pb-6">
                                <h3 className="text-xl font-black text-indigo-900 uppercase italic">Shopping Bag</h3>
                                <button onClick={() => setShowCart(false)} className="text-gray-400 text-2xl font-black">×</button>
                            </div>
                            <div className="flex-grow overflow-y-auto py-6 space-y-4">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between bg-gray-50 p-4 rounded-2xl border-l-4 border-indigo-500">
                                        <p className="font-black text-xs uppercase">{item.name} (x{item.qty})</p>
                                        <p className="font-black text-xs">₦{(item.price * item.qty).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-6 space-y-4">
                                <div className="flex justify-between font-black text-xl text-indigo-900 uppercase italic">
                                    <span>Total Cost</span>
                                    <span>₦{cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}</span>
                                </div>
                                <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-green-700">Pay Now</button>
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
