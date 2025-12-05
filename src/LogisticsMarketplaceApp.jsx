import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

const Button = ({ children, onClick, color = 'indigo', fullWidth = false }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition duration-200 
                    ${fullWidth ? 'w-full' : ''} bg-${color}-600 text-white hover:bg-${color}-700`}
    >
        {children}
    </button>
);

// Mock Jobs data for Rider View (Since we haven't created the Job assignment endpoint yet)
const mockJobs = [
    { id: 1, pickup: 'Lagos Island Market', dropoff: 'Ikeja Residential', fee: 1500, distance: '12.5 km' },
    { id: 2, pickup: 'Victoria Island HQ', dropoff: 'Surulere Apt.', fee: 2200, distance: '18 km' },
];


// --- THE CORE APPLICATION COMPONENT ---
const App = ({ user }) => {
    if (!user) return <div className="p-10 text-center">Authentication Error.</div>; 

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('marketplace'); // Default view

    // Fetch Real Products from your Backend
    useEffect(() => {
        fetch(`${API_URL}/products`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    // Function to handle Buy Now logic
    const handleBuyNow = async (product) => {
        // ... (Order placement logic remains the same)
        const orderData = {
            buyerId: user.id, 
            productId: product._id,
            price: product.price,
            deliveryFee: 1500 
        };

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (res.ok) {
                alert(`SUCCESS! Order ID ${data.order._id} Placed. Commission: ${data.yourCommission.toLocaleString()}`);
            } else {
                alert(`ERROR: ${data.error || 'Failed to place order.'}`);
            }

        } catch (error) {
            alert('Network error placing order.');
        }
    };

    // --- Conditional Content Rendering ---

    const renderContent = () => {
        if (user.role === 'rider') {
            return (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-700">Rider Job Dashboard</h2>
                    <p className="text-gray-500">Available Jobs (Mock Data)</p>
                    {mockJobs.map(job => (
                        <div key={job.id} className="bg-white p-4 rounded shadow border-l-4 border-green-500 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Pickup: {job.pickup}</p>
                                <p className="text-sm">Distance: {job.distance}</p>
                            </div>
                            <Button color="green" onClick={() => alert(`Rider accepted Job #${job.id}`)}>
                                Accept Job (₦{job.fee})
                            </Button>
                        </div>
                    ))}
                    <p className="mt-8 text-xs text-gray-400">Note: This is the view for unemployed youth to earn money.</p>
                </div>
            );
        }

        if (user.role === 'seller' || user.role === 'buyer' || user.role === 'admin') {
            return (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500">
                        <h3 className="text-xl font-bold mb-2">Seller/Admin Status</h3>
                        <p className="text-3xl font-extrabold text-green-600">Active</p>
                        <p className="text-sm text-gray-500 mt-2">View orders or manage listings.</p>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Live Marketplace (All Roles Can View)</h2>
                    
                    {loading ? (
                        <p className="text-center text-gray-500">Loading products from cloud...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map(p => (
                                <div key={p._id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{p.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <div>
                                            <p className="text-xs text-gray-400">Seller: {p.seller?.name || 'Unknown'}</p>
                                            <p className="text-indigo-600 font-bold text-xl">₦{p.price.toLocaleString()}</p>
                                        </div>
                                        <Button onClick={() => handleBuyNow(p)}>Buy Now</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4">
            <header className="bg-white shadow-sm p-4 mb-6 rounded-lg flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-700">SwiftLogi</h1>
                <span className="text-sm font-normal text-gray-600">Logged in as: **{user.role.toUpperCase()}**</span>
            </header>

            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
