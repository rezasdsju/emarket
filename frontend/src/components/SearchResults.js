import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef(null);
    
    // URL থেকে প্যারামিটার পড়ুন
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    const page = queryParams.get('page') || 1;
    const sortByFromUrl = queryParams.get('sort_by') || 'relevance';
    
    // ফিল্টার স্টেট
    const [filters, setFilters] = useState({
        category: '',
        min_price: '',
        max_price: '',
        sort_by: sortByFromUrl
    });
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    // সর্ট লেবেল ফাংশন
    const getSortLabel = (sortValue) => {
        switch(sortValue) {
            case 'relevance': return 'রিলেভেন্স';
            case 'price_asc': return 'দাম: কম থেকে বেশি';
            case 'price_desc': return 'দাম: বেশি থেকে কম';
            case 'newest': return 'নতুন আগে';
            default: return 'রিলেভেন্স';
        }
    };
    
    // সার্চ ফাংশন
    const performSearch = async (sortParam = null) => {
        if (!query || query.trim() === '') {
            navigate('/');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // URL তৈরি করুন সব প্যারামিটার সহ
            const params = new URLSearchParams();
            params.append('q', query);
            params.append('page', page);
            
            // সর্ট প্যারামিটার (প্রথমে আর্গুমেন্ট চেক, তারপর স্টেট)
            const sortToUse = sortParam || filters.sort_by;
            if (sortToUse && sortToUse !== 'relevance') {
                params.append('sort_by', sortToUse);
            }
            
            if (filters.category) params.append('category', filters.category);
            if (filters.min_price) params.append('min_price', filters.min_price);
            if (filters.max_price) params.append('max_price', filters.max_price);
            
            const apiUrl = `${API_BASE_URL}/api/search/?${params.toString()}`;
            
            console.log('🔍 Search API URL:', apiUrl);
            
            const response = await axios.get(apiUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 15000
            });
            
            if (response.data.success) {
                setSearchData(response.data);
                console.log('✅ Search successful. Sort type:', response.data.sort_by);
                
                // সর্টিং ডিবাগ
                if (response.data.products && response.data.products.length > 0) {
                    console.log('💰 First 3 product prices after sorting:');
                    response.data.products.slice(0, 3).forEach((p, i) => {
                        console.log(`${i+1}. ${p.name}: ৳${p.price} (Sort: ${response.data.sort_by})`);
                    });
                }
            } else {
                throw new Error(response.data.error || 'Search failed');
            }
            
        } catch (err) {
            console.error('❌ Search error:', err);
            setError('সার্চ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };
    
    // প্রাথমিক লোডিং
    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query, page]);
    
    // সর্ট পরিবর্তন হলে নতুন সার্চ করুন
    useEffect(() => {
        if (query) {
            performSearch(filters.sort_by);
        }
    }, [filters.sort_by]);
    
    // ড্রপডাউন বাইরে ক্লিক করলে বন্ধ করার জন্য
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // সর্ট নির্বাচন হ্যান্ডলার
    const handleSortSelect = (sortValue) => {
        console.log(`🎯 Sorting selected: ${sortValue}`);
        
        // ফিল্টার আপডেট করুন
        setFilters(prev => ({
            ...prev,
            sort_by: sortValue
        }));
        
        // ড্রপডাউন বন্ধ করুন
        setShowSortDropdown(false);
        
        // URL আপডেট করুন
        const params = new URLSearchParams(location.search);
        if (sortValue && sortValue !== 'relevance') {
            params.set('sort_by', sortValue);
        } else {
            params.delete('sort_by');
        }
        navigate(`?${params.toString()}`);
    };
    
    // ফিল্টার রিসেট
    const clearFilters = () => {
        setFilters({
            category: '',
            min_price: '',
            max_price: '',
            sort_by: 'relevance'
        });
        setShowSortDropdown(false);
        
        // URL রিসেট
        const params = new URLSearchParams();
        params.set('q', query);
        navigate(`?${params.toString()}`, { replace: true });
    };
    
    // লোডিং স্টেট
    if (loading && !searchData) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">"{query}" এর জন্য সার্চ রেজাল্ট লোড হচ্ছে...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>Search Error</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => performSearch()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    
    if (!searchData || !searchData.success) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    <h4>সার্চ ফলাফল পাওয়া যায়নি</h4>
                    <p>"{query}" এর সাথে মিলে এমন কোনো পণ্য পাওয়া যায়নি।</p>
                </div>
            </div>
        );
    }
    
    const { products, total_results, total_pages, current_page, sort_by } = searchData;
    
    return (
        <div className="search-results-page container mt-4">
            {/* হেডার */}
            <div className="search-header mb-4">
                <div className="row">
                    <div className="col-md-8">
                        <h1 className="h3 fw-bold mb-3">
                            <i className="bi bi-search me-2"></i>
                            Search Results: "{query}"
                        </h1>
                        
                        <div className="alert alert-light border">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="badge bg-primary rounded-pill me-2">
                                        <i className="bi bi-box-seam"></i>
                                    </span>
                                    <strong>{total_results}</strong> টি পণ্য পাওয়া গেছে
                                </div>
                                <div className="text-muted small">
                                    Page {current_page} / {total_pages} | 
                                    Sort: {getSortLabel(sort_by)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* সর্ট ড্রপডাউন */}
                    <div className="col-md-4" ref={sortDropdownRef}>
                        <div className="position-relative">
                            <button 
                                className="btn btn-outline-primary w-100 d-flex justify-content-between align-items-center py-2"
                                type="button"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                aria-expanded={showSortDropdown}
                            >
                                <span>
                                    <i className="bi bi-sort-down me-2"></i>
                                    {getSortLabel(filters.sort_by)}
                                </span>
                                <i className={`bi bi-chevron-${showSortDropdown ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {showSortDropdown && (
                                <div className="sort-dropdown-menu shadow-lg border rounded bg-white mt-1 position-absolute w-100"
                                     style={{ zIndex: 1050 }}>
                                    
                                    <div className="sort-options">
                                        {[
                                            {value: 'relevance', label: 'রিলেভেন্স', icon: 'bi-star', desc: 'সার্চ টার্মের সাথে সবচেয়ে মিল আছে এমন'},
                                            {value: 'price_asc', label: 'দাম: কম থেকে বেশি', icon: 'bi-sort-numeric-down', desc: 'সর্বনিম্ন দামের পণ্য আগে'},
                                            {value: 'price_desc', label: 'দাম: বেশি থেকে কম', icon: 'bi-sort-numeric-up', desc: 'সর্বোচ্চ দামের পণ্য আগে'},
                                            {value: 'newest', label: 'নতুন আগে', icon: 'bi-clock', desc: 'সর্বশেষ যোগকৃত পণ্য আগে'}
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                className={`sort-option-item w-100 text-start p-3 border-bottom ${
                                                    filters.sort_by === option.value ? 'bg-primary text-white' : ''
                                                }`}
                                                onClick={() => handleSortSelect(option.value)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <i className={`${option.icon} me-3 fs-5`}></i>
                                                    <div>
                                                        <div className="fw-semibold">{option.label}</div>
                                                        <small className={filters.sort_by === option.value ? 'text-white' : 'text-muted'}>
                                                            {option.desc}
                                                        </small>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* সর্টিং স্ট্যাটাস */}
            {filters.sort_by !== 'relevance' && (
                <div className="alert alert-info mb-4">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-info-circle-fill me-2 fs-4"></i>
                        <div>
                            <strong>Products are Sorted:</strong> {getSortLabel(filters.sort_by)}
                            <div className="small mt-1">
                                {filters.sort_by === 'price_asc' ? 'সর্বনিম্ন দামের পণ্য প্রথমে দেখানো হচ্ছে' :
                                 filters.sort_by === 'price_desc' ? 'সর্বোচ্চ দামের পণ্য প্রথমে দেখানো হচ্ছে' :
                                 'সর্বশেষ যোগকৃত পণ্য প্রথমে দেখানো হচ্ছে'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* মূল কন্টেন্ট */}
            <div className="row">
                {/* সার্চ রেজাল্ট */}
                <div className="col-12">
                    {products.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="display-1 text-muted mb-3">
                                    <i className="bi bi-search"></i>
                                </div>
                                <h4 className="text-muted mb-3">কোনো পণ্য পাওয়া যায়নি</h4>
                                <p className="text-muted mb-4">
                                    "{query}" এর সাথে মিলে এমন কোনো পণ্য নেই।
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* সর্টিং যাচাইকারী (ডিবাগ) */}
                            {products.length > 1 && (
                                <div className="alert alert-light border mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Sorting Check:</strong> Currently sorted by {getSortLabel(sort_by)}
                                        </div>
                                        <button 
                                            className="btn btn-sm btn-outline-info"
                                            onClick={() => {
                                                console.log('🔍 Current sorted products:');
                                                products.forEach((p, i) => {
                                                    console.log(`${i+1}. ${p.name}: ৳${p.price}`);
                                                });
                                            }}
                                        >
                                            <i className="bi bi-bug me-1"></i>
                                            ডিবাগ লগ
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* পণ্য গ্রিড */}
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                                {products.map((product) => (
                                    <div key={product.id} className="col">
                                        <ProductCard product={product} />
                                        <div className="text-center mt-2 small text-muted">
                                            Price: TK{product.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* পেজিনেশন */}
                            {total_pages > 1 && (
                                <nav className="mt-5">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${current_page <= 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => {
                                                    const params = new URLSearchParams(location.search);
                                                    params.set('page', parseInt(current_page) - 1);
                                                    navigate(`?${params.toString()}`);
                                                }}
                                                disabled={current_page <= 1}
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        
                                        {[...Array(Math.min(5, total_pages)).keys()].map(i => {
                                            const pageNum = i + 1;
                                            return (
                                                <li key={pageNum} className={`page-item ${parseInt(current_page) === pageNum ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link"
                                                        onClick={() => {
                                                            const params = new URLSearchParams(location.search);
                                                            params.set('page', pageNum);
                                                            navigate(`?${params.toString()}`);
                                                        }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        
                                        <li className={`page-item ${current_page >= total_pages ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => {
                                                    const params = new URLSearchParams(location.search);
                                                    params.set('page', parseInt(current_page) + 1);
                                                    navigate(`?${params.toString()}`);
                                                }}
                                                disabled={current_page >= total_pages}
                                            >
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* CSS */}
            <style jsx>{`
                .sort-dropdown-menu {
                    animation: fadeIn 0.2s ease;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .sort-option-item {
                    transition: all 0.2s ease;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                }
                
                .sort-option-item:hover {
                    background-color: #f8f9fa !important;
                }
                
                .sort-option-item.bg-primary:hover {
                    background-color: #0b5ed7 !important;
                }
                
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            `}</style>
        </div>
    );
};

export default SearchResults;