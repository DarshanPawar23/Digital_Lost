import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------
// 💡 NEW IMPORTS FOR TENSORFLOW.JS IMAGE MATCHING
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
// ----------------------------------------------------

// Tesseract setup is kept for FIR OCR
// GEMINI_API_URL and API_KEY are now only used for the old code placeholder, 
// but we will keep them commented out to ensure they are not used.

// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=";
// const API_KEY = ""; 

function SearchPage() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState({ product: '', category: '', location: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [firImage, setFirImage] = useState(null);
    const [matchImage, setMatchImage] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const [matchResult, setMatchResult] = useState({});
    const [verificationLoading, setVerificationLoading] = useState(false);
    
    // NOTE: tesseractReady state is no longer strictly necessary for dummy OCR, 
    // but it is kept to show the loading status in the button.
    const [tesseractReady, setTesseractReady] = useState(true); // Set to true immediately for dummy
    const [mobileNetModel, setMobileNetModel] = useState(null);

    // Helper functions (Unchanged, although base64 is not used for dummy OCR)
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const loadImageFromUrl = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url; 
        });
    };

    // --- Loading MobileNet Model ---
    useEffect(() => {
        // Dummy load script logic removal/simplification
        // Set Tesseract Ready to true immediately for faster UI interaction in the dummy mode
        // setTesseractReady(true); 

        // Load MobileNet Model (TensorFlow.js)
        const loadMobileNet = async () => {
            try {
                const model = await mobilenet.load({ version: 2, alpha: 0.5 });
                console.log('MobileNet Model Loaded.');
                setMobileNetModel(model);
            } catch (error) {
                console.error('Failed to load MobileNet model:', error);
            }
        };
        loadMobileNet();
        // Cleanup return removed for brevity since Tesseract script loading is simplified
    }, []);

    // --- Search Handlers (Unchanged) ---
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchQuery(prev => ({ ...prev, [name]: value }));
        setSearchError('');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        setSearchError('');
        setSearchResults([]);

        const params = {
            product: searchQuery.product || undefined,
            category: searchQuery.category || undefined,
            location: searchQuery.location || undefined,
        };

        try {
            const response = await axios.get('http://localhost:5000/api/search', { params });
            setSearchResults(response.data.results);
            setSearchError(response.data.message);

        } catch (err) {
            console.error('Search API Error:', err.response?.data || err);
            setSearchError(err.response?.data?.message || 'Failed to perform search. Check server connection.');
        } finally {
            setSearchLoading(false);
        }
    };
    
    // ----------------------------------------------------------------------
    // 💡 MODIFIED: DUMMY handleOcrVerification (Simulates delay and success/failure)
    // ----------------------------------------------------------------------
    const handleOcrVerification = async () => {
        if (!firImage) {
            alert('Please select the Police Report/FIR image first.');
            return;
        }

        setVerificationLoading(true);
        setOcrResult(null);

        // Dummy Delay to simulate network/processing time (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Simulate 80% success rate
            const success = Math.random() < 0.8;

            if (success) {
                // Simulate successful, verified data extraction
                const dummyData = {
                    case_id: "FIR/01/2025/487",
                    file_date: "15/09/2025",
                    complainant_name: "RAKESH KUMAR SHARMA",
                };
                setOcrResult(dummyData);
            } else {
                // Simulate failure (e.g., poor image quality, unreadable text)
                setOcrResult({ 
                    error: "The report image was too blurry or the text was unreadable. Please try a clearer scan or photo." 
                });
            }

        } catch (error) {
            // Catch unexpected errors during simulation
            console.error("Dummy OCR Simulation Error:", error);
            setOcrResult({ error: `Verification process encountered an unexpected issue: ${error.message}` });
        } finally {
            setVerificationLoading(false);
        }
    };

    // --- TensorFlow.js Math (Unchanged) ---
    const calculateSimilarity = (embedding1, embedding2) => {
        const tensor1 = tf.tensor(embedding1);
        const tensor2 = tf.tensor(embedding2);
        
        const dotProduct = tf.sum(tf.mul(tensor1, tensor2));
        const magnitude1 = tf.norm(tensor1);
        const magnitude2 = tf.norm(tensor2);
        const magnitudes = tf.mul(magnitude1, magnitude2);

        const similarity = dotProduct.div(magnitudes).dataSync()[0];

        // Clean up tensors
        tensor1.dispose();
        tensor2.dispose();
        dotProduct.dispose();
        magnitude1.dispose();
        magnitude2.dispose();
        magnitudes.dispose();
        
        return similarity;
    };

    // --- handleVisualMatch (Unchanged) ---
    const handleVisualMatch = async (foundImagePath, itemId) => {
        if (!matchImage) {
            alert('Please select your lost item image first.');
            return;
        }
        if (!mobileNetModel) {
            alert('Image comparison model is still loading. Please wait.');
            return;
        }
        setVerificationLoading(true);
        setMatchResult({});

        try {
            const userImageElement = await createImageBitmap(matchImage); 
            const foundImageElement = await loadImageFromUrl(`http://localhost:5000/${foundImagePath}`);

            const userEmbeddings = tf.tidy(() => {
                const imgTensor = tf.browser.fromPixels(userImageElement).resizeBilinear([224, 224]);
                return mobileNetModel.infer(imgTensor, true).arraySync();
            });

            const foundEmbeddings = tf.tidy(() => {
                const imgTensor = tf.browser.fromPixels(foundImageElement).resizeBilinear([224, 224]);
                return mobileNetModel.infer(imgTensor, true).arraySync();
            });

            const similarityScore = calculateSimilarity(userEmbeddings[0], foundEmbeddings[0]); 
            
            let match_likelihood, comparison_notes;

            if (similarityScore > 0.8) {
                match_likelihood = 'High';
                comparison_notes = `The feature vector similarity score of ${similarityScore.toFixed(3)} indicates a high likelihood of a match.`;
            } else if (similarityScore > 0.6) {
                match_likelihood = 'Medium';
                comparison_notes = `The similarity score of ${similarityScore.toFixed(3)} is moderate. Further manual checks are recommended.`;
            } else {
                match_likelihood = 'Low';
                comparison_notes = `The low similarity score of ${similarityScore.toFixed(3)} suggests this is likely not the same item.`;
            }
            
            setMatchResult(prev => ({ ...prev, [itemId]: { match_likelihood, comparison_notes } }));

        } catch (error) {
            console.error("TF.js Match Error:", error);
            setMatchResult(prev => ({ ...prev, [itemId]: { error: `Image comparison failed: ${error.message}` } }));
        } finally {
            setVerificationLoading(false);
        }
    };

    // --- handleContactRetrieve (Unchanged) ---
    const handleContactRetrieve = async (itemId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/contact/${itemId}`);
            alert(`Finder Contact: ${response.data.contact}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to retrieve contact.');
        }
    };

    // --- Render Component (Unchanged) ---

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white relative font-sans">
            <style>{`
                /* ... (styles are unchanged) ... */
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

            {/* --- Header/Navbar Placeholder --- */}
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
                <div className="text-cyan-400 text-sm font-semibold">
                    Search Lost & Found 🔎
                </div>
            </nav>

            {/* --- Main Search & Verification Content --- */}
            <div className="p-4 sm:p-6 md:p-10 relative z-10 flex-grow">
                <div className="w-full max-w-6xl mx-auto space-y-8">
                    
                    {/* --- 1. Search Form (Unchanged) --- */}
                    <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Find Your Lost Item</h2>
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="flex flex-col space-y-1 md:col-span-1">
                                <label className="text-sm text-gray-400">Product Name / Keyword</label>
                                <input
                                    type="text"
                                    name="product"
                                    value={searchQuery.product}
                                    onChange={handleSearchChange}
                                    placeholder="e.g., wallet, keys, black backpack"
                                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex flex-col space-y-1 md:col-span-1">
                                <label className="text-sm text-gray-400">Category (Optional)</label>
                                <select
                                    name="category"
                                    value={searchQuery.category}
                                    onChange={handleSearchChange}
                                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Categories</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Bag">Bag/Backpack</option>
                                    <option value="Key">Keys</option>
                                    {/* ... other categories ... */}
                                </select>
                            </div>
                            <div className="flex flex-col space-y-1 md:col-span-1">
                                <label className="text-sm text-gray-400">Location / City</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={searchQuery.location}
                                    onChange={handleSearchChange}
                                    placeholder="e.g., Central Station, Bengaluru"
                                    className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searchLoading || (!searchQuery.product && !searchQuery.location)}
                                className="md:col-span-1 py-2 px-4 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:bg-gray-600"
                            >
                                {searchLoading ? 'Searching...' : 'Search Found Items'}
                            </button>
                        </form>
                        {searchError && <p className="mt-4 text-sm text-red-400">{searchError}</p>}
                    </div>
                    
                    {/* --- 2. Search Results and Verification Sidebar --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Verification Tools */}
                        <div className="lg:col-span-1 space-y-6">
                            
                            {/* Verification Tool 1: OCR Document Check (Dummy) */}
                            <div className="glass-panel p-5 rounded-xl space-y-3 shadow-lg border-yellow-500/20">
                                <h3 className="font-semibold text-lg text-yellow-300">1. Police Report (FIR) Verification</h3>
                                <p className="text-sm text-gray-400">Upload your police report image to securely extract key details (Case ID, Name) for verification.</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFirImage(e.target.files[0])}
                                    className="w-full file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400 transition-colors bg-gray-800/50 rounded-lg py-2 text-gray-400"
                                />
                                <button 
                                    onClick={handleOcrVerification} 
                                    disabled={verificationLoading || !firImage}
                                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-semibold disabled:bg-gray-600"
                                >
                                    {verificationLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Verifying Report... (2s delay)
                                        </span>
                                    ) : 'Extract & Verify FIR Details (DUMMY)'}
                                </button>
                                {ocrResult && (
                                    <div className={`p-3 rounded text-xs break-words ${ocrResult.error ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                                        {ocrResult.error ? (
                                            <p className="font-semibold">Verification Failed: {ocrResult.error}</p>
                                        ) : (
                                            <div className='space-y-1'>
                                                <p className="font-bold">✅ Report Accepted & Verified:</p>
                                                <p><strong>Case ID:</strong> {ocrResult.case_id}</p>
                                                <p><strong>Filing Date:</strong> {ocrResult.file_date}</p>
                                                <p><strong>Complainant:</strong> {ocrResult.complainant_name}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Verification Tool 2: Visual Item Match (TF.js) */}
                            <div className="glass-panel p-5 rounded-xl space-y-3 shadow-lg border-cyan-500/20">
                                <h3 className="font-semibold text-lg text-cyan-300">2. Lost Item Image Match (via AI)</h3>
                                <p className="text-sm text-gray-400">Upload an image of your lost item for a visual comparison against search results.</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setMatchImage(e.target.files[0])}
                                    className="w-full file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-gray-900 hover:file:bg-cyan-400 transition-colors bg-gray-800/50 rounded-lg py-2 text-gray-400"
                                />
                                {matchImage && <p className="text-xs text-gray-500">Ready to compare: {matchImage.name}</p>}
                                {!mobileNetModel && <p className="text-xs text-yellow-500 mt-2">Loading TensorFlow model for matching...</p>}
                            </div>
                        </div>

                        {/* Right Column: Search Results List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-lg font-bold text-white">Results ({searchResults.length})</h3>

                            {searchResults.length === 0 && !searchLoading ? (
                                <div className="glass-panel p-10 text-center rounded-xl text-gray-500">
                                    Start searching above to see potential matches.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {searchResults.map(item => (
                                        <div key={item.item_id} className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between transition-shadow hover:shadow-indigo-500/30">
                                            
                                            <div className="flex-shrink-0 w-full sm:w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
                                                <img 
                                                    src={`http://localhost:5000/${item.image_path}`} 
                                                    alt={item.description.substring(0, 20)} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/1f2937/a1a1aa?text=No+Image" }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <p className="text-base font-semibold text-indigo-300 truncate">{item.category}: {item.description.substring(0, 50)}...</p>
                                                <div className="flex items-center space-x-3 text-xs text-gray-400">
                                                    <span>📍 {item.city}</span>
                                                    <span>•</span>
                                                    <span>Found: {new Date(item.found_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 flex-shrink-0 w-full sm:w-auto">
                                                
                                                <button
                                                    onClick={() => handleVisualMatch(item.image_path, item.item_id)}
                                                    // Disable if loading, no image, OR model isn't ready
                                                    disabled={verificationLoading || !matchImage || !mobileNetModel}
                                                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-600"
                                                >
                                                    {verificationLoading && matchResult[item.item_id]?.error === undefined ? 'Comparing...' : 'Match Item'}
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleContactRetrieve(item.item_id)}
                                                    // This button is only enabled if OCR is done AND the Image Match is 'High'
                                                    disabled={matchResult[item.item_id]?.match_likelihood !== 'High' || !ocrResult || ocrResult.error} 
                                                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
                                                >
                                                    Retrieve Contact
                                                </button>

                                            </div>
                                            
                                            {/* Match Result Display */}
                                            {matchResult[item.item_id] && (
                                                <div className={`mt-2 p-3 rounded-lg text-xs w-full sm:col-span-3 ${matchResult[item.item_id].error ? 'bg-red-900/40 text-red-300' : (matchResult[item.item_id].match_likelihood === 'High' ? 'bg-green-900/40 text-green-300' : 'bg-yellow-900/40 text-yellow-300')}`}>
                                                    <p className="font-bold">Match Status:</p>
                                                    {matchResult[item.item_id].error ? (
                                                        <p>Error: {matchResult[item.item_id].error}</p>
                                                    ) : (
                                                        <>
                                                            <p>Likelihood: **{matchResult[item.item_id].match_likelihood}**</p>
                                                            <p>Notes: {matchResult[item.item_id].comparison_notes}</p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="w-full p-4 text-center text-gray-600 text-xs border-t border-gray-800 bg-gray-900/50 backdrop-blur-md z-10">
                <p>© 2025 ReConnect Systems. All rights reserved. Secure & Encrypted.</p>
            </footer>
        </div>
    );
}

export default SearchPage;