import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PostPage() {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [formData, setFormData] = useState({
        description: '',
        location_desc: '',
        contact_no: '',
        city: '',
        category: '',
        latitude: '',
        longitude: '',
        image: null, 
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [placeName, setPlaceName] = useState('');

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setMessage('');
        setError('');
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
            // Added user-agent header as requested by Nominatim service policy
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'ReConnect Lost and Found App / v1.0' }
            });
            
            const address = response.data.address;
            let city = address.city || address.town || address.village || address.county || '';
            let display_name = response.data.display_name;

            setPlaceName(display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            
            // Autofill the city and use the full address for location_desc
            setFormData(prev => ({ 
                ...prev, 
                city: city, 
                location_desc: display_name.substring(0, 150) // Use a longer snippet or full name
            }));
            setMessage('Location details successfully fetched and fields autofilled.');

        } catch (err) {
            console.error('Reverse Geocoding Error:', err);
            setPlaceName('Could not find place name.');
            setError('Location captured, but failed to find readable address. Please enter city manually.');
        }
    };

    const handleGetLocation = () => {
        setMessage('Attempting to fetch your current location...');
        setError('');
        setPlaceName('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                    }));
                    
                    reverseGeocode(lat, lng); 
                    
                    setMessage('Coordinates captured. Fetching city name...');
                },
                (err) => {
                    console.error("Geolocation Error:", err);
                    setError('Could not retrieve location. Check browser permissions/device settings.');
                    setMessage('');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
            setMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!formData.image || !formData.category || !formData.description || !formData.contact_no || !formData.city) {
            setError('Please fill in all required fields (including the City field).');
            setLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await axios.post('http://localhost:5000/api/found/upload', data);
            setMessage(response.data.message || 'Item successfully posted!');
            setTimeout(() => navigate('/'), 3000); 
            
        } catch (err) {
            console.error('Submission Error:', err.response ? err.response.data : err);
            setError(err.response?.data?.message || 'Failed to post item. Server or network error.');
        } finally {
            setLoading(false);
        }
    };

    // --- Component Structure with Tailwind Classes ---
    return (
        // Full screen container with animated background style copied from Home component
        <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-hidden relative font-sans">
            <style>{`
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animated-gradient {
                    background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #111827);
                    background-size: 400% 400%;
                    animation: gradient-shift 20s ease infinite;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
            <div className="animated-gradient absolute inset-0 -z-10"></div>

            {/* --- Header/Navbar Placeholder (To keep styling consistent) --- */}
            <nav className="w-full p-6 flex justify-between items-center z-20 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        Re<span className="text-indigo-500">Connect</span>
                    </span>
                </div>
                <div className="text-indigo-400 text-sm font-semibold">
                    Reporting Found Item 📷
                </div>
            </nav>

            {/* --- Main Content Area --- */}
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-10 relative z-10">
                <div className="w-full max-w-4xl">
                    <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl space-y-8">
                        
                        <header className="text-center space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                                Report a Found Valuable
                            </h1>
                            <p className="text-gray-400">
                                Provide details and the location where you found the item.
                            </p>
                        </header>

                        {/* --- Feedback Area --- */}
                        {(loading || error || message) && (
                            <div className="transition-all duration-300">
                                {loading && <p className="text-center p-3 text-indigo-300 bg-indigo-900/30 rounded-lg font-medium">Submitting item...</p>}
                                {error && <p className="text-center p-3 text-red-400 bg-red-900/30 border border-red-500/50 rounded-lg font-semibold">🚨 {error}</p>}
                                {message && !loading && !error && <p className="text-center p-3 text-green-400 bg-green-900/30 border border-green-500/50 rounded-lg font-semibold">✅ {message}</p>}
                            </div>
                        )}

                        {/* --- Form --- */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* SECTION 1: Item Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-indigo-400 border-b border-gray-700 pb-2">Item Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <div className="flex flex-col space-y-2">
                                        <label htmlFor="category" className="text-sm font-medium text-gray-300">Category <span className="text-red-500">*</span></label>
                                        <select 
                                            id="category" 
                                            name="category" 
                                            value={formData.category} 
                                            onChange={handleChange} 
                                            required 
                                            className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="">Select Item Category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Bag">Bag/Backpack</option>
                                            <option value="Key">Keys</option>
                                            <option value="Document">ID/Document</option>
                                            <option value="Wallet">Wallet/Purse</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <label htmlFor="image" className="text-sm font-medium text-gray-300">Item Image <span className="text-red-500">*</span></label>
                                        <input 
                                            type="file" 
                                            id="image" 
                                            name="image" 
                                            accept="image/*"
                                            onChange={handleFileChange} 
                                            required 
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition-colors bg-gray-800 border border-gray-700 rounded-lg py-2 text-gray-400"
                                        />
                                        {formData.image && <small className="text-xs text-gray-500">Selected: **{formData.image.name}**</small>}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium text-gray-300">Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="A detailed description, including color, brand, and unique features."
                                        required
                                        rows="3"
                                        className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                                    />
                                </div>
                            </div>

                            {/* SECTION 2: Location Details */}
                            <div className="space-y-4 p-5 bg-gray-800/50 rounded-xl border border-gray-700">
                                <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-600 pb-2">Location Found</h3>
                                
                                {/* Location Button */}
                                <button 
                                    type="button" 
                                    onClick={handleGetLocation} 
                                    disabled={loading}
                                    className="w-full py-3 rounded-lg font-bold text-base transition-all transform hover:-translate-y-0.5 shadow-md 
                                    text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:shadow-none"
                                >
                                    {placeName 
                                        ? `✅ Captured: ${placeName.substring(0, 70)}${placeName.length > 70 ? '...' : ''}`
                                        : formData.latitude 
                                        ? `Fetching address for: ${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                                        : '📍 Capture Live GPS Location (Recommended)'
                                    }
                                </button>
                                <p className="text-xs text-gray-500 text-center -mt-2">
                                    Click above to use your device's exact location and automatically fill the city.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    
                                    <div className="flex flex-col space-y-2">
                                        <label htmlFor="city" className="text-sm font-medium text-gray-300">City/Area <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city} 
                                            onChange={handleChange}
                                            placeholder="City/Area (Autofilled)"
                                            required
                                            className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                        />
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <label htmlFor="location_desc" className="text-sm font-medium text-gray-300">Specific Spot Description</label>
                                        <input
                                            type="text"
                                            id="location_desc"
                                            name="location_desc"
                                            value={formData.location_desc}
                                            onChange={handleChange}
                                            placeholder="Platform 3, Bench near exit"
                                            className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* SECTION 3: Contact Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-indigo-400 border-b border-gray-700 pb-2">Your Contact Information</h3>
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="contact_no" className="text-sm font-medium text-gray-300">Your Contact Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        id="contact_no"
                                        name="contact_no"
                                        value={formData.contact_no}
                                        onChange={handleChange}
                                        placeholder="+919876543210"
                                        required
                                        className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <small className="text-xs text-gray-500">This number is used for contact only upon a confirmed match.</small>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={loading || !formData.image || !formData.category || !formData.description || !formData.contact_no || !formData.city} 
                                className="w-full py-4 rounded-xl font-extrabold text-lg transition-all transform hover:-translate-y-1 shadow-lg 
                                bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 disabled:bg-gray-600 disabled:shadow-none"
                            >
                                {loading ? 'Processing Submission...' : 'Post Found Item'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <footer className="w-full p-4 text-center text-gray-600 text-xs border-t border-gray-800 bg-gray-900/50 backdrop-blur-md z-10">
                <p>© 2025 ReConnect Systems. All rights reserved. Secure & Encrypted.</p>
            </footer>
        </div>
    );
}

export default PostPage;