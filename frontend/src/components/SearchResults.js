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
    const categoryFromUrl = queryParams.get('category') || '';
    const minPriceFromUrl = queryParams.get('min_price') || '';
    const maxPriceFromUrl = queryParams.get('max_price') || '';
    
    // ফিল্টার স্টেট URL থেকে ইনিশিয়ালাইজ করুন
    const [filters, setFilters] = useState({
        category: categoryFromUrl,
        min_price: minPriceFromUrl,
        max_price: maxPriceFromUrl,
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
                console.log('✅ Search successful. Products:', response.data.products?.length);
                
                // ডিবাগ: সর্টিং যাচাই করুন
                if (response.data.products && response.data.products.length > 0) {
                    console.log('💰 First 3 product prices:');
                    response.data.products.slice(0, 3).forEach((p, i) => {
                        console.log(`${i+1}. ${p.name}: ৳${p.price} (Sort: ${sortToUse})`);
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
        // URL থেকে প্যারামিটার আপডেট
        const params = new URLSearchParams(location.search);
        
        // সর্ট প্যারামিটার আপডেট
        if (filters.sort_by && filters.sort_by !== 'relevance') {
            params.set('sort_by', filters.sort_by);
        } else {
            params.delete('sort_by');
        }
        
        // ফিল্টার প্যারামিটার আপডেট
        if (filters.category) {
            params.set('category', filters.category);
        } else {
            params.delete('category');
        }
        
        if (filters.min_price) {
            params.set('min_price', filters.min_price);
        } else {
            params.delete('min_price');
        }
        
        if (filters.max_price) {
            params.set('max_price', filters.max_price);
        } else {
            params.delete('max_price');
        }
        
        // নতুন URL তৈরি
        const newUrl = `?${params.toString()}`;
        
        // যদি URL পরিবর্তন হয়ে থাকে, তাহলে সার্চ করুন
        if (newUrl !== `?${location.search}`) {
            performSearch(filters.sort_by);
        }
    }, [filters.sort_by, filters.category, filters.min_price, filters.max_price]);
    
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
        
        // URL আপডেট করবে এবং useEffect ট্রিগার হবে
    };
    
    // ফিল্টার পরিবর্তন হ্যান্ডলার
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
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
    
    // পেজিনেশন হ্যান্ডলার
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(location.search);
        params.set('page', newPage);
        navigate(`?${params.toString()}`);
        window.scrollTo(0, 0);
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
                    <button className="btn btn-primary" onClick={() => performSearch()}>
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
                <div className="row">
                    <div className="col-md-8">
                        <h1 className="h3 fw-bold mb-3">
                            <i className="bi bi-search me-2"></i>
                            সার্চ ফলাফল: "{query}"
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
                                    পৃষ্ঠা {current_page} / {total_pages}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* সর্ট ড্রপডাউন */}
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
                                                    <i className={`${option.icon} me-3`}></i>
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
                        
                        {/* বর্তমান সর্ট স্ট্যাটাস */}
                        <div className="mt-2 small text-center">
                            <span className="badge bg-info">
                                <i className="bi bi-check-circle me-1"></i>
                                বর্তমান: {getSortLabel(sort_by || filters.sort_by)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ফিল্টার সেকশন */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-currency-dollar me-1"></i>
                                        সর্বনিম্ন দাম
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="সর্বনিম্ন দাম"
                                        value={filters.min_price}
                                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                    />
                                </div>
                                
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-currency-dollar me-1"></i>
                                        সর্বোচ্চ দাম
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="সর্বোচ্চ দাম"
                                        value={filters.max_price}
                                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                    />
                                </div>
                                
                                <div className="col-md-4 d-flex align-items-end">
                                    <button 
                                        className="btn btn-outline-danger w-100"
                                        onClick={clearFilters}
                                        disabled={!filters.min_price && !filters.max_price && filters.sort_by === 'relevance'}
                                    >
                                        <i className="bi bi-x-circle me-1"></i>
                                        ফিল্টার রিসেট
                                    </button>
                                </div>
                            </div>
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
                            <strong>পণ্যগুলো সর্ট করা হয়েছে:</strong> {getSortLabel(filters.sort_by)}
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
                                <button 
                                    className="btn btn-primary"
                                    onClick={clearFilters}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    ফিল্টার রিসেট করুন
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* সর্টিং ভেরিফিকেশন (ডিবাগ) */}
                            {process.env.NODE_ENV === 'development' && products.length > 1 && (
                                <div className="alert alert-warning mb-3">
                                    <details>
                                        <summary className="fw-bold">সর্টিং ডিবাগ তথ্য</summary>
                                        <div className="mt-2">
                                            <p className="mb-1">
                                                <strong>সর্ট টাইপ:</strong> {sort_by || filters.sort_by}
                                            </p>
                                            <p className="mb-1">
                                                <strong>প্রথম ৩টি পণ্যের দাম:</strong>
                                            </p>
                                            <ul className="mb-1">
                                                {products.slice(0, 3).map((p, i) => (
                                                    <li key={i}>
                                                        {i+1}. {p.name}: <strong>৳{p.price}</strong>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button 
                                                className="btn btn-sm btn-outline-info mt-1"
                                                onClick={() => performSearch(filters.sort_by)}
                                            >
                                                API আবার কল করুন
                                            </button>
                                        </div>
                                    </details>
                                </div>
                            )}
                            
                            {/* পণ্য গ্রিড */}
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                                {products.map((product) => (
                                    <div key={product.id} className="col">
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
                                                onClick={() => handlePageChange(parseInt(current_page) - 1)}
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
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        
                                        {total_pages > 5 && (
                                            <li className="page-item disabled">
                                                <span className="page-link">...</span>
                                            </li>
                                        )}
                                        
                                        <li className={`page-item ${current_page >= total_pages ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => handlePageChange(parseInt(current_page) + 1)}
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
            
            {/* ফুটার সেকশন */}
            <div className="mt-5 pt-4 border-top">
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <div>
                        <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            {total_results} টি পণ্য পাওয়া গেছে | সর্ট: {getSortLabel(sort_by || filters.sort_by)}
                        </small>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            <i className="bi bi-arrow-up me-1"></i>
                            উপরে যান
                        </button>
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate('/')}
                        >
                            <i className="bi bi-house me-1"></i>
                            হোমপেজ
                        </button>
                    </div>
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
                
                .product-grid {
                    transition: all 0.3s ease;
                }
                
                .pagination .page-item.active .page-link {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
            `}</style>
        </div>
    );
};

export default SearchResults;