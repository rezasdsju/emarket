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
    const [filters, setFilters] = useState({
        category: '',
        min_price: '',
        max_price: '',
        sort_by: 'relevance'
    });
    
    // ✅ সর্ট ড্রপডাউনের জন্য স্টেট
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef(null);
    
    const query = new URLSearchParams(location.search).get('q') || '';
    const page = new URLSearchParams(location.search).get('page') || 1;
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    useEffect(() => {
        if (query) {
            performSearch();
        } else {
            navigate('/');
        }
    }, [query, page, filters.sort_by]);
    
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
    
    const performSearch = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let apiUrl = `${API_BASE_URL}/api/search/?q=${encodeURIComponent(query)}&page=${page}`;
            
            const params = [];
            if (filters.category) params.push(`category=${filters.category}`);
            if (filters.min_price) params.push(`min_price=${filters.min_price}`);
            if (filters.max_price) params.push(`max_price=${filters.max_price}`);
            if (filters.sort_by) params.push(`sort_by=${filters.sort_by}`);
            
            if (params.length > 0) {
                apiUrl += '&' + params.join('&');
            }
            
            console.log('Search API URL:', apiUrl);
            
            const response = await axios.get(apiUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 10000
            });
            
            setSearchData(response.data);
            
        } catch (err) {
            console.error('Search error:', err);
            setError('সার্চ করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setShowSortDropdown(false); // ✅ সর্ট নির্বাচন করলে ড্রপডাউন বন্ধ হবে
    };
    
    const handleSortSelect = (sortValue) => {
        handleFilterChange('sort_by', sortValue);
    };
    
    const clearFilters = () => {
        setFilters({
            category: '',
            min_price: '',
            max_price: '',
            sort_by: 'relevance'
        });
        setShowSortDropdown(false);
    };
    
    // যদি state থেকে ডাটা থাকে
    useEffect(() => {
        if (location.state?.searchData) {
            setSearchData(location.state.searchData);
            setLoading(false);
        }
    }, [location.state]);
    
    // ✅ সর্ট অপশনের লেবেল ফাংশন
    const getSortLabel = (sortValue) => {
        switch(sortValue) {
            case 'relevance': return 'রিলেভেন্স';
            case 'price_asc': return 'দাম: কম থেকে বেশি';
            case 'price_desc': return 'দাম: বেশি থেকে কম';
            case 'newest': return 'নতুন আগে';
            default: return 'রিলেভেন্স';
        }
    };
    
    if (loading) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">লোড হচ্ছে...</span>
                </div>
                <p className="mt-3">
                    "{query}" এর জন্য সার্চ রেজাল্ট লোড হচ্ছে...
                </p>
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
                    
                    {/* ✅ সর্ট ড্রপডাউন - কাস্টম ইমপ্লিমেন্টেশন */}
                    <div className="col-md-4" ref={sortDropdownRef}>
                        <div className="position-relative">
                            <button 
                                className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                                type="button"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                aria-expanded={showSortDropdown}
                                aria-label="সর্ট অপশন"
                            >
                                <span>
                                    <i className="bi bi-sort-down me-1"></i>
                                    সর্ট: {getSortLabel(filters.sort_by)}
                                </span>
                                <i className={`bi bi-chevron-${showSortDropdown ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {/* ✅ কাস্টম ড্রপডাউন মেনু */}
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
                                        <button
                                            className={`sort-option-item w-100 text-start p-3 border-bottom ${filters.sort_by === 'relevance' ? 'bg-primary text-white' : ''}`}
                                            onClick={() => handleSortSelect('relevance')}
                                        >
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-star me-3"></i>
                                                <div>
                                                    <div className="fw-semibold">রিলেভেন্স</div>
                                                    <small className={filters.sort_by === 'relevance' ? 'text-white' : 'text-muted'}>
                                                        সার্চ টার্মের সাথে সবচেয়ে মিল আছে এমন
                                                    </small>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            className={`sort-option-item w-100 text-start p-3 border-bottom ${filters.sort_by === 'price_asc' ? 'bg-primary text-white' : ''}`}
                                            onClick={() => handleSortSelect('price_asc')}
                                        >
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-sort-numeric-up me-3"></i>
                                                <div>
                                                    <div className="fw-semibold">দাম: কম থেকে বেশি</div>
                                                    <small className={filters.sort_by === 'price_asc' ? 'text-white' : 'text-muted'}>
                                                        সর্বনিম্ন দামের পণ্য আগে
                                                    </small>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            className={`sort-option-item w-100 text-start p-3 border-bottom ${filters.sort_by === 'price_desc' ? 'bg-primary text-white' : ''}`}
                                            onClick={() => handleSortSelect('price_desc')}
                                        >
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-sort-numeric-down me-3"></i>
                                                <div>
                                                    <div className="fw-semibold">দাম: বেশি থেকে কম</div>
                                                    <small className={filters.sort_by === 'price_desc' ? 'text-white' : 'text-muted'}>
                                                        সর্বোচ্চ দামের পণ্য আগে
                                                    </small>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            className={`sort-option-item w-100 text-start p-3 ${filters.sort_by === 'newest' ? 'bg-primary text-white' : ''}`}
                                            onClick={() => handleSortSelect('newest')}
                                        >
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-clock me-3"></i>
                                                <div>
                                                    <div className="fw-semibold">নতুন আগে</div>
                                                    <small className={filters.sort_by === 'newest' ? 'text-white' : 'text-muted'}>
                                                        সর্বশেষ যোগকৃত পণ্য আগে
                                                    </small>
                                                </div>
                                            </div>
                                        </button>
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
            
            {/* ফিল্টার সাইডবার এবং রেজাল্ট */}
            <div className="row">
                {/* ফিল্টার সাইডবার */}
                <div className="col-lg-3 mb-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-funnel me-2"></i>
                                ফিল্টার
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* প্রাইস ফিল্টার */}
                            <div className="mb-4">
                                <h6 className="border-bottom pb-2 mb-3">দামের রেঞ্জ</h6>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="সর্বনিম্ন"
                                            value={filters.min_price}
                                            onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="সর্বোচ্চ"
                                            value={filters.max_price}
                                            onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* ফিল্টার রিসেট */}
                            {(filters.min_price || filters.max_price || filters.category || filters.sort_by !== 'relevance') && (
                                <button 
                                    className="btn btn-outline-secondary w-100 mt-3"
                                    onClick={clearFilters}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    সব ফিল্টার ক্লিয়ার করুন
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* সার্চ রেজাল্ট */}
                <div className="col-lg-9">
                    {products.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="display-1 text-muted mb-4">
                                    <i className="bi bi-search"></i>
                                </div>
                                <h4 className="text-muted mb-3">কোনো পণ্য পাওয়া যায়নি</h4>
                                <p className="text-muted mb-4">
                                    "{query}" এর সাথে মিলে এমন কোনো পণ্য নেই। 
                                    অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন অথবা ক্যাটাগরি ব্রাউজ করুন।
                                </p>
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => navigate('/')}
                                    >
                                        <i className="bi bi-house me-1"></i>
                                        হোমপেজ
                                    </button>
                                    <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => navigate('/categories')}
                                    >
                                        <i className="bi bi-tags me-1"></i>
                                        ক্যাটাগরি ব্রাউজ করুন
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* পণ্য গ্রিড */}
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                                {products.map(product => (
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
                                                onClick={() => navigate(`/search?q=${query}&page=${current_page - 1}&sort_by=${filters.sort_by}`)}
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        
                                        {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <li key={pageNum} className={`page-item ${current_page === pageNum ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link"
                                                        onClick={() => navigate(`/search?q=${query}&page=${pageNum}&sort_by=${filters.sort_by}`)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        
                                        <li className={`page-item ${current_page >= total_pages ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => navigate(`/search?q=${query}&page=${current_page + 1}&sort_by=${filters.sort_by}`)}
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
            
            {/* সার্চ টার্ম সুজেশন */}
            <div className="mt-5 pt-4 border-top">
                <h5 className="mb-3">সম্পর্কিত সার্চ টার্মস</h5>
                <div className="d-flex flex-wrap gap-2">
                    {['মধু', 'আখরোট', 'কিচমিচ', 'বাদাম', 'চেরিফল', 'কালজিরা', 'হানি নাট'].map(term => (
                        <button
                            key={term}
                            className="btn btn-outline-secondary"
                            onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* ✅ CSS স্টাইলস */}
            <style jsx>{`
                .search-header {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 20px;
                    border-radius: 10px;
                }
                
                .product-card {
                    transition: all 0.3s ease;
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                
                /* ✅ কাস্টম সর্ট ড্রপডাউন স্টাইল */
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
                    color: #000 !important;
                }
                
                .sort-option-item.bg-primary:hover {
                    background-color: #0b5ed7 !important;
                    color: #fff !important;
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
                
                /* ✅ মোবাইল রেসপন্সিভ স্টাইল */
                @media (max-width: 768px) {
                    .sort-dropdown-menu {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 90% !important;
                        max-width: 400px !important;
                        max-height: 70vh !important;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
                    }
                    
                    .sort-option-item {
                        padding: 15px !important;
                    }
                    
                    .search-header .row {
                        flex-direction: column;
                    }
                    
                    .search-header .col-md-4 {
                        margin-top: 10px;
                        width: 100%;
                    }
                    
                    .search-header .col-md-8 {
                        width: 100%;
                    }
                }
                
                @media (max-width: 576px) {
                    .sort-option-item {
                        padding: 12px !important;
                        font-size: 0.9rem;
                    }
                    
                    .sort-option-item small {
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default SearchResults;