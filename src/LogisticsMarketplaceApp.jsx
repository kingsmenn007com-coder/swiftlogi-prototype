import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

const PasswordInput = ({ value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input 
                type={show ? "text" : "password"} 
                placeholder={placeholder} 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                onChange={onChange} required
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-[10px] font-black text-indigo-600 uppercase">
                {show ? 'Hide' : 'Show'}
            </button>
        </div>
    );
};

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            } else { setMsg('✅ Success! Log in now.'); setIsLogin(true); }
        } else { setMsg('❌ ' + data.error); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi V7</h1>
                {msg && <div className="mb-4 p-3 rounded font-bold text-center text-sm bg-indigo-50 text-indigo-700">{msg}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <PasswordInput onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Password" />
                    {!isLogin && (
                        <select className="w-full p-3 border rounded-xl bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="user">I want to Buy/Sell</option>
                            <option value="rider">I want to Deliver (Rider)</option>
                        </select>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold uppercase shadow-lg">
                        {isLogin ? 'Sign In' : 'Join Network'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-indigo-600 font-bold uppercase hover:underline">
                    {isLogin ? "No account? Register" : "Already a member? Login"}
                </button>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

    const fetchAll = useCallback(async () => {
        const [pRes, oRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/user/orders/${user.id}`)
        ]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(i => i._id === product._id);
            if (exists) return prev.map(i => i._id === product._id ? {...i, quantity: i.quantity + 1} : i);
            return [...prev, {...product, quantity: 1}];
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...newProduct, sellerId: user.id, sellerName: user.name})
        });
        if (res.ok) { alert("🚀 Product Live Across Nigeria!"); setShowUpload(false); fetchAll(); }
    };

    const handleCheckout = async () => {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, buyerId: user.id })
        });
        if (res.ok) { alert("📦 Orders Placed!"); setCart([]); setShowCart(false); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded-xl shadow-sm flex justify-between items-center max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowCart(!showCart)} className="bg-indigo-100 p-2 rounded-lg text-indigo-700 font-black text-xs uppercase">
                        🛒 Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
                    </button>
                    {user.role === 'user' && (
                        <button onClick={() => setShowUpload(true)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                            + Sell Item
                        </button>
                    )}
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow">Logout</button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Marketplace Section */}
                    <section className="grid md:grid-cols-3 gap-4">
                        {products.map(p => (
                            <div key={p._id} className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-indigo-500">
                                <h3 className="font-black text-gray-800">{p.name}</h3>
                                <p className="text-xs text-gray-400 mb-2 italic">Seller: {p.sellerName || 'Verified Seller'}</p>
                                <p className="text-xl font-black text-indigo-600">₦{Number(p.price).toLocaleString()}</p>
                                <button onClick={() => addToCart(p)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-bold uppercase text-[10px]">Add to Cart</button>
                            </div>
                        ))}
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Cart Section */}
                    {showCart && (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-indigo-100">
                            <h3 className="font-black text-indigo-700 uppercase text-xs mb-3">Shopping Cart</h3>
                            {cart.length === 0 ? <p className="text-[10px] text-gray-400">Cart is empty</p> : (
                                <>
                                    {cart.map(i => (
                                        <div key={i._id} className="flex justify-between text-[10px] mb-2 border-b pb-1">
                                            <span>{i.name} (x{i.quantity})</span>
                                            <span className="font-bold">₦{(i.price * i.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-2 mt-2 rounded-lg font-black text-[10px] uppercase">Checkout</button>
                                </>
                            )}
                        </div>
                    )}

                    <section className="bg-white p-4 rounded-2xl shadow-sm">
                        <h3 className="font-black text-gray-500 uppercase text-xs mb-3">Your Activity</h3>
                        {orders.map(o => (
                            <div key={o._id} className="text-[10px] mb-2 p-2 bg-gray-50 rounded border-l-4 border-indigo-400">
                                <p className="font-bold">{o.product?.name} (x{o.quantity})</p>
                                <p className="font-black uppercase text-indigo-500">{o.status}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </main>

            {/* Seller Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-md w-full">
                        <h2 className="text-xl font-black text-indigo-700 mb-4 uppercase">Upload Product</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <input type="text" placeholder="Product Name" className="w-full p-3 border rounded-xl" onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                            <input type="number" placeholder="Price (₦)" className="w-full p-3 border rounded-xl" onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                            <textarea placeholder="Description" className="w-full p-3 border rounded-xl" onChange={e => setNewProduct({...newProduct, description: e.target.value})} required />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-xs">Publish Now</button>
                                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 bg-gray-200 text-gray-600 py-3 rounded-xl font-black uppercase text-xs">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Dashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
