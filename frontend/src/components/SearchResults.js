import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // ✅ URL থেকে প্যারামিটার পড়ুন
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    const page = queryParams.get('page') || 1;
    const sortByFromUrl = queryParams.get('sort_by') || 'relevance';
    
    // ✅ ফিল্টার স্টেট URL থেকে ইনিশিয়ালাইজ করুন
    const [filters, setFilters] = useState({
        category: '',
        min_price: '',
        max_price: '',
        sort_by: sortByFromUrl
    });
    
    // ✅ সর্ট ড্রপডাউনের জন্য স্টেট
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef(null);
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    // ✅ সার্চ ফাংশন - useCallback দিয়ে মেমোইজ করুন
    const performSearch = useCallback(async () => {
        if (!query || query.trim() === '') {
            navigate('/');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // ✅ URL তৈরি করুন সব প্যারামিটার সহ
            const params = new URLSearchParams();
            params.append('q', query);
            params.append('page', page);
            
            if (filters.sort_by && filters.sort_by !== 'relevance') {
                params.append('sort_by', filters.sort_by);
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
                console.log('✅ Search successful. Sort by:', response.data.sort_by);
                
                // ✅ ডিবাগ: পণ্যের দাম দেখুন
                if (response.data.products && response.data.products.length > 0) {
                    console.log('💰 Product prices (first 5):');
                    response.data.products.slice(0, 5).forEach((p, i) => {
                        console.log(`${i+1}. ${p.name}: ৳${p.price}`);
                    });
                }
            } else {
                throw new Error(response.data.error || 'Search failed');
            }
            
        } catch (err) {
            console.error('❌ Search error:', err);
            setError('সার্চ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
            
            // ✅ Fallback: স্থানীয়ভাবে সর্ট করুন
            if (searchData && searchData.products) {
                console.log('🔄 Applying local sorting...');
                const sortedProducts = sortProductsLocally(searchData.products, filters.sort_by);
                setSearchData(prev => ({
                    ...prev,
                    products: sortedProducts,
                    sort_by: filters.sort_by
                }));
            }
        } finally {
            setLoading(false);
        }
    }, [query, page, filters, navigate, searchData]);
    
    // ✅ স্থানীয় সর্টিং ফাংশন
    const sortProductsLocally = (products, sortType) => {
        const sorted = [...products];
        
        switch(sortType) {
            case 'price_asc':
                return sorted.sort((a, b) => {
                    const priceA = parseFloat(a.price) || 0;
                    const priceB = parseFloat(b.price) || 0;
                    return priceA - priceB;
                });
                
            case 'price_desc':
                return sorted.sort((a, b) => {
                    const priceA = parseFloat(a.price) || 0;
                    const priceB = parseFloat(b.price) || 0;
                    return priceB - priceA;
                });
                
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.created || a.created_at || 0);
                    const dateB = new Date(b.created || b.created_at || 0);
                    return dateB - dateA;
                });
                
            default:
                return sorted;
        }
    };
    
    // ✅ useEffect: প্রাথমিক লোডিং
    useEffect(() => {
        // URL থেকে sort_by পড়ুন
        const urlSortBy = queryParams.get('sort_by') || 'relevance';
        
        // স্টেট আপডেট করুন যদি URL থেকে ভিন্ন হয়
        if (filters.sort_by !== urlSortBy) {
            setFilters(prev => ({
                ...prev,
                sort_by: urlSortBy
            }));
        }
        
        // সার্চ করুন
        if (query) {
            performSearch();
        }
    }, [query, page, location.search]); // ✅ location.search যোগ করুন
    
    // ✅ useEffect: সর্ট পরিবর্তন হলে URL আপডেট
    useEffect(() => {
        // URL আপডেট করুন
        const params = new URLSearchParams(location.search);
        
        if (filters.sort_by && filters.sort_by !== 'relevance') {
            params.set('sort_by', filters.sort_by);
        } else {
            params.delete('sort_by');
        }
        
        // নতুন URL তৈরি করুন
        const newUrl = `?${params.toString()}`;
        
        // যদি বর্তমান URL থেকে ভিন্ন হয়, তাহলে নেভিগেট করুন
        if (newUrl !== `?${location.search}`) {
            navigate(newUrl, { replace: true });
        }
    }, [filters.sort_by, location.search, navigate]);
    
    // ✅ ড্রপডাউন বাইরে ক্লিক করলে বন্ধ করার জন্য
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // ✅ সর্ট নির্বাচন হ্যান্ডলার
    const handleSortSelect = (sortValue) => {
        console.log(`🎯 Sorting selected: ${sortValue}`);
        
        // ১. ফিল্টার আপডেট করুন
        setFilters(prev => ({
            ...prev,
            sort_by: sortValue
        }));
        
        // ২. ড্রপডাউন বন্ধ করুন
        setShowSortDropdown(false);
        
        // ৩. সরাসরি সার্চ কল করুন (useEffect এর উপর নির্ভর না করে)
        setTimeout(() => {
            performSearch();
        }, 0);
    };
    
    // ✅ ফিল্টার রিসেট
    const clearFilters = () => {
        setFilters({
            category: '',
            min_price: '',
            max_price: '',
            sort_by: 'relevance'
        });
        setShowSortDropdown(false);
        
        // URL রিসেট
        const params = new URLSearchParams(location.search);
        params.delete('sort_by');
        params.delete('category');
        params.delete('min_price');
        params.delete('max_price');
        navigate(`?${params.toString()}`, { replace: true });
    };
    
    // ✅ সর্ট লেবেল ফাংশন
    const getSortLabel = (sortValue) => {
        switch(sortValue) {
            case 'relevance': return 'রিলেভেন্স';
            case 'price_asc': return 'দাম: কম থেকে বেশি';
            case 'price_desc': return 'দাম: বেশি থেকে কম';
            case 'newest': return 'নতুন আগে';
            default: return 'রিলেভেন্স';
        }
    };
    
    // লোডিং স্টেট
    if (loading && !searchData) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">লোড হচ্ছে...</span>
                </div>
                <p className="mt-3">"{query}" এর জন্য সার্চ রেজাল্ট লোড হচ্ছে...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>সার্চ এরর</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={performSearch}>
                        আবার চেষ্টা করুন
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
                <h1 className="h3 fw-bold mb-3">
                    <i className="bi bi-search me-2"></i>
                    সার্চ ফলাফল: "{query}"
                </h1>
                
                <div className="row">
                    <div className="col-md-8">
                        <div className="alert alert-light border d-flex justify-content-between align-items-center">
                            <div>
                                <span className="badge bg-primary rounded-pill me-2">
                                    <i className="bi bi-box-seam"></i>
                                </span>
                                <strong>{total_results}</strong> টি পণ্য পাওয়া গেছে
                            </div>
                            <div className="text-muted small">
                                পৃষ্ঠা {current_page} / {total_pages} | 
                                সর্ট: {getSortLabel(sort_by)}
                            </div>
                        </div>
                    </div>
                    
                    {/* ✅ সর্ট ড্রপডাউন */}
                    <div className="col-md-4" ref={sortDropdownRef}>
                        <div className="position-relative">
                            <button 
                                className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                                type="button"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                aria-expanded={showSortDropdown}
                            >
                                <span>
                                    <i className="bi bi-sort-down me-1"></i>
                                    সর্ট: {getSortLabel(filters.sort_by)}
                                </span>
                                <i className={`bi bi-chevron-${showSortDropdown ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {showSortDropdown && (
                                <div className="sort-dropdown-menu shadow-lg border rounded bg-white mt-1 position-absolute w-100"
                                     style={{ zIndex: 1050 }}>
                                    
                                    <div className="sort-option-header p-2 border-bottom bg-light">
                                        <small className="text-muted">
                                            <i className="bi bi-filter me-1"></i>
                                            সর্ট অপশন নির্বাচন করুন
                                        </small>
                                    </div>
                                    
                                    <div className="sort-options">
                                        {['relevance', 'price_asc', 'price_desc', 'newest'].map((option) => (
                                            <button
                                                key={option}
                                                className={`sort-option-item w-100 text-start p-3 border-bottom ${
                                                    filters.sort_by === option ? 'bg-primary text-white' : ''
                                                }`}
                                                onClick={() => handleSortSelect(option)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <i className={`bi ${
                                                        option === 'relevance' ? 'bi-star' :
                                                        option === 'price_asc' ? 'bi-sort-numeric-up' :
                                                        option === 'price_desc' ? 'bi-sort-numeric-down' :
                                                        'bi-clock'
                                                    } me-3`}></i>
                                                    <div>
                                                        <div className="fw-semibold">{getSortLabel(option)}</div>
                                                        <small className={filters.sort_by === option ? 'text-white' : 'text-muted'}>
                                                            {option === 'relevance' ? 'সার্চ টার্মের সাথে সবচেয়ে মিল আছে এমন' :
                                                             option === 'price_asc' ? 'সর্বনিম্ন দামের পণ্য আগে' :
                                                             option === 'price_desc' ? 'সর্বোচ্চ দামের পণ্য আগে' :
                                                             'সর্বশেষ যোগকৃত পণ্য আগে'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="p-2 border-top bg-light">
                                        <button 
                                            className="btn btn-sm btn-outline-secondary w-100"
                                            onClick={() => setShowSortDropdown(false)}
                                        >
                                            <i className="bi bi-x me-1"></i>
                                            বন্ধ করুন
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* মূল কন্টেন্ট */}
            <div className="row">
                {/* ফিল্টার সাইডবার */}
                <div className="col-lg-3 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-funnel me-2"></i>
                                ফিল্টার
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <h6 className="border-bottom pb-2">বর্তমান সর্ট</h6>
                                <div className="alert alert-info py-2">
                                    <strong>{getSortLabel(filters.sort_by)}</strong>
                                    <div className="small text-muted">
                                        URL সর্ট: {getSortLabel(sort_by)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* ডিবাগ তথ্য */}
                            <div className="mt-3 pt-3 border-top">
                                <details className="small">
                                    <summary className="text-muted">ডিবাগ তথ্য</summary>
                                    <div className="mt-2">
                                        <p className="mb-1">
                                            <strong>Query:</strong> {query}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Local sort:</strong> {filters.sort_by}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Server sort:</strong> {sort_by}
                                        </p>
                                        <button 
                                            className="btn btn-sm btn-outline-info w-100 mt-2"
                                            onClick={performSearch}
                                        >
                                            API আবার কল করুন
                                        </button>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* সার্চ রেজাল্ট */}
                <div className="col-lg-9">
                    {products.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <h4 className="text-muted mb-3">কোনো পণ্য পাওয়া যায়নি</h4>
                                <p className="text-muted mb-4">
                                    "{query}" এর সাথে মিলে এমন কোনো পণ্য নেই।
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* পণ্য গ্রিড */}
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                                {products.map((product, index) => (
                                    <div key={`${product.id}-${index}`} className="col">
                                        <ProductCard product={product} />
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
                                                    params.set('page', current_page - 1);
                                                    navigate(`?${params.toString()}`);
                                                }}
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        
                                        {[...Array(Math.min(5, total_pages)).keys()].map(i => {
                                            const pageNum = i + 1;
                                            return (
                                                <li key={pageNum} className={`page-item ${current_page === pageNum ? 'active' : ''}`}>
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
                                                    params.set('page', current_page + 1);
                                                    navigate(`?${params.toString()}`);
                                                }}
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
                }
                
                .sort-option-item:hover {
                    background-color: #f8f9fa !important;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SearchResults;