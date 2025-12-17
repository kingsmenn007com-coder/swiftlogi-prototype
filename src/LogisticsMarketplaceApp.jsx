import React, { useState, useEffect, useCallback } from 'react';

const API_URL = "https://swiftlogi-backend.onrender.com/api";

// --- Multi-Purpose Password Input ---
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
    const [status, setStatus] = useState({ type: '', msg: '' });

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
                } else { setStatus({ type: 'success', msg: '✅ Ready! Please Login.' }); setIsLogin(true); }
            } else { setStatus({ type: 'error', msg: data.error }); }
        } catch (err) { setStatus({ type: 'error', msg: 'Connection Error' }); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-indigo-600">
                <h1 className="text-3xl font-black text-center text-indigo-800 mb-6 italic uppercase">SwiftLogi V7</h1>
                {status.msg && <div className={`mb-4 p-3 rounded font-bold text-center text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.msg}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />}
                    <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl outline-none" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <PasswordInput onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Password" />
                    {!isLogin && <select className="w-full p-3 border rounded-xl bg-white font-bold" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user">I want to Buy/Sell</option>
                        <option value="rider">I want to Deliver (Rider)</option>
                    </select>}
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold uppercase shadow-lg tracking-widest hover:bg-indigo-700">
                        {isLogin ? 'Sign In' : 'Join Network'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-indigo-600 font-bold uppercase hover:underline">
                    {isLogin ? "No account? Register" : "Have an account? Login"}
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

    const fetchAll = useCallback(async () => {
        const [pRes, oRes] = await Promise.all([fetch(`${API_URL}/products`), fetch(`${API_URL}/user/orders/${user.id}`)]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
    }, [user.id]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(item => item._id === product._id);
            if (exists) return prev.map(item => item._id === product._id ? {...item, quantity: item.quantity + 1} : item);
            return [...prev, {...product, quantity: 1}];
        });
        setShowCart(true);
    };

    const handleCheckout = async () => {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, buyerId: user.id })
        });
        if (res.ok) { alert("✅ Orders Placed Successfully!"); setCart([]); setShowCart(false); fetchAll(); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <header className="bg-white p-4 mb-6 rounded-xl shadow-sm flex justify-between items-center max-w-5xl mx-auto">
                <h1 className="text-2xl font-black text-indigo-700 italic">SWIFTLOGI</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowCart(!showCart)} className="relative p-2 bg-indigo-50 rounded-full text-indigo-600 font-bold">
                        🛒 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                    </button>
                    <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow hover:bg-red-700">LOGOUT</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-widest">Available Goods</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition border-t-4 border-indigo-500">
                                    <h3 className="font-black text-gray-800">{p.name}</h3>
                                    <p className="text-2xl font-black text-indigo-600">₦{p.price.toLocaleString()}</p>
                                    <button onClick={() => addToCart(p)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg">Add to Cart</button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="space-y-8">
                    {showCart && (
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-indigo-100">
                            <h3 className="font-black text-indigo-700 uppercase text-xs mb-4">Your Shopping Cart</h3>
                            {cart.length === 0 ? <p className="text-xs text-gray-400">Cart is empty</p> : (
                                <>
                                    {cart.map(item => (
                                        <div key={item._id} className="flex justify-between items-center text-xs mb-2 pb-2 border-b">
                                            <span>{item.name} (x{item.quantity})</span>
                                            <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="mt-4 pt-4 border-t-2">
                                        <div className="flex justify-between font-black text-sm mb-4">
                                            <span>Total:</span>
                                            <span>₦{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                                        </div>
                                        <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">Checkout Now</button>
                                    </>
                            )}
                        </div>
                    )}

                    <section>
                        <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Personal History</h3>
                        {orders.map(o => (
                            <div key={o._id} className="bg-white p-4 rounded-xl shadow-sm mb-2 flex justify-between border-l-4 border-indigo-400 text-xs">
                                <div><p className="font-bold">{o.product?.name} (x{o.quantity || 1})</p><p className="font-black text-indigo-500 uppercase text-[8px]">{o.status}</p></div>
                                <span className="font-bold">₦{(o.price * (o.quantity || 1)).toLocaleString()}</span>
                            </div>
                        ))}
                    </section>
                </aside>
            </main>
        </div>
    );
};

export default function MainApp() {
    const [user, setUser] = useState(null);
    useEffect(() => { const u = localStorage.getItem('user'); if(u) setUser(JSON.parse(u)); }, []);
    return user ? <Dashboard user={user} onLogout={() => { localStorage.clear(); setUser(null); }} /> : <Auth onLogin={u => setUser(u)} />;
}
