import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [heroProducts, setHeroProducts] = useState([]); // ✅ শুধু পণ্য (ইমেজ সহ)
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    // ✅ ইমেজ URL তৈরি করার ফাংশন
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('/media/')) {
            return `${API_BASE_URL}${imagePath}`;
        }
        
        if (imagePath.startsWith('media/')) {
            return `${API_BASE_URL}/${imagePath}`;
        }
        
        return `${API_BASE_URL}/media/${imagePath}`;
    };
    
    useEffect(() => {
        fetchData();
        
        // ✅ 5 সেকেন্ড পরপর হিরো পণ্য চেঞ্জ
        const interval = setInterval(() => {
            if (heroProducts.length > 0) {
                setCurrentProductIndex((prevIndex) => 
                    (prevIndex + 1) % heroProducts.length
                );
            }
        }, 5000); // 5 সেকেন্ড
        
        return () => clearInterval(interval); // Cleanup
    }, [heroProducts.length]);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('ডেটা লোড শুরু হচ্ছে...');
            
            const [productsResponse, categoriesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/products/`, {
                    headers: { 'Accept': 'application/json' }
                }).catch(err => {
                    console.error('Products API Error:', err);
                    return axios.get('http://127.0.0.1:8000/api/products/');
                }),
                
                axios.get(`${API_BASE_URL}/api/categories/`, {
                    headers: { 'Accept': 'application/json' }
                }).catch(err => {
                    console.error('Categories API Error:', err);
                    return axios.get('http://127.0.0.1:8000/api/categories/');
                })
            ]);
            
            // ✅ পণ্য ডেটা প্রসেস
            let productsData = [];
            if (productsResponse.data.results) {
                productsData = productsResponse.data.results;
            } else if (Array.isArray(productsResponse.data)) {
                productsData = productsResponse.data;
            }
            
            setProducts(productsData);
            
            // ✅ হিরো পণ্য (শুধু ইমেজ আছে এমন পণ্য)
            const productsWithImages = productsData.filter(product => {
                // ইমেজ আছে এবং available
                return product.image && product.available;
            });
            
            // যদি ৫টির কম ইমেজ থাকে, তাহলে প্রথম ৫টি পণ্য (ইমেজ ছাড়াও)
            const heroProductsList = productsWithImages.length >= 5 
                ? productsWithImages.slice(0, 5)
                : productsData.slice(0, 5);
            
            setHeroProducts(heroProductsList);
            
            // ✅ ক্যাটাগরি ডেটা প্রসেস
            let categoriesData = [];
            if (categoriesResponse.data.results) {
                categoriesData = categoriesResponse.data.results;
            } else if (Array.isArray(categoriesResponse.data)) {
                categoriesData = categoriesResponse.data;
            }
            
            setCategories(categoriesData);
            
            setLoading(false);
            
        } catch (err) {
            console.error('ডেটা লোড করতে সমস্যা:', err);
            
            let errorMessage = 'ডেটা লোড করতে সমস্যা হচ্ছে।';
            
            if (err.response) {
                console.error('Error Response Data:', err.response.data);
                console.error('Error Response Status:', err.response.status);
                
                if (err.response.status === 404) {
                    errorMessage = 'API এন্ডপয়েন্ট পাওয়া যায়নি। সার্ভার চেক করুন।';
                } else if (err.response.status === 500) {
                    errorMessage = 'সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে।';
                }
            } else if (err.request) {
                errorMessage = 'সার্ভার রেসপন্স দিচ্ছে না। সার্ভার চালু আছে কিনা চেক করুন।';
            } else {
                errorMessage = `Network Error: ${err.message}`;
            }
            
            setError(errorMessage);
            setProducts([]);
            setCategories([]);
            setHeroProducts([]);
            setLoading(false);
        }
    };
    
    // ✅ হিরো পণ্য নেভিগেশন
    const nextProduct = () => {
        if (heroProducts.length > 0) {
            setCurrentProductIndex((prevIndex) => 
                (prevIndex + 1) % heroProducts.length
            );
        }
    };
    
    const prevProduct = () => {
        if (heroProducts.length > 0) {
            setCurrentProductIndex((prevIndex) => 
                prevIndex === 0 ? heroProducts.length - 1 : prevIndex - 1
            );
        }
    };
    
    // ফিল্টার করা পণ্য
    const getFilteredProducts = () => {
        switch (activeTab) {
            case 'featured':
                return products.filter(product => product.featured);
            case 'new':
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return products.filter(product => {
                    const createdDate = new Date(product.created_at || product.date_added);
                    return createdDate > thirtyDaysAgo;
                });
            case 'discount':
                return products.filter(product => 
                    product.discount_price && product.discount_price < product.price
                );
            default:
                return products;
        }
    };
    
    // লোডিং স্টেট
    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">লোড হচ্ছে...</span>
                </div>
                <p className="mt-3 fs-5">অর্গানিক বাজার লোড হচ্ছে...</p>
                <p className="text-muted">
                    <small>API: {API_BASE_URL}/api/products/</small>
                </p>
                <div className="progress mt-3" style={{ height: '4px', maxWidth: '300px', margin: '0 auto' }}>
                    <div className="progress-bar progress-bar-striped progress-bar-animated" 
                         style={{ width: '100%' }}></div>
                </div>
            </div>
        );
    }
    
    // এরর স্টেট
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <h4 className="alert-heading">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        ডেটা লোড করতে ব্যর্থ!
                    </h4>
                    <p>{error}</p>
                    <hr />
                    <div className="d-flex flex-column flex-md-row gap-2">
                        <button className="btn btn-primary me-md-2" onClick={fetchData}>
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            আবার চেষ্টা করুন
                        </button>
                        <a 
                            href={`${API_BASE_URL}/api/products/`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline-primary"
                        >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            API সরাসরি দেখুন
                        </a>
                        <a 
                            href="/" 
                            className="btn btn-outline-secondary"
                        >
                            <i className="bi bi-house me-1"></i>
                            হোমে ফিরে যান
                        </a>
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            </div>
        );
    }
    
    const filteredProducts = getFilteredProducts();
    const currentProduct = heroProducts[currentProductIndex];
    
    return (
        <div className="home-page">
            {/* হিরো সেকশন - Admin পণ্য Slider */}
            <div className="hero-section bg-primary text-white py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-3">অর্গানিক বাজারে স্বাগতম!</h1>
                            <p className="lead mb-4">
                                প্রকৃতির সেরা উপহার - ১০০% প্রাকৃতিক, রাসায়নিক মুক্ত পণ্য। 
                                আপনার স্বাস্থ্য সুরক্ষার জন্য আমরা নির্বাচন করি সেরা অর্গানিক পণ্য।
                            </p>
                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/products" className="btn btn-light btn-lg px-4">
                                    <i className="bi bi-cart me-2"></i>
                                    সব পণ্য দেখুন
                                </Link>
                                <Link to="/categories" className="btn btn-outline-light btn-lg px-4">
                                    <i className="bi bi-tags me-2"></i>
                                    ক্যাটাগরি ব্রাউজ করুন
                                </Link>
                            </div>
                        </div>
                        
                        <div className="col-lg-6 text-center position-relative">
                            {/* ✅ Slider Container */}
                            <div className="hero-slider-container">
                                {currentProduct ? (
                                    <div className="hero-product-wrapper position-relative">
                                        {/* Admin-এ আপলোড করা ইমেজ */}
                                        <img 
                                            src={getImageUrl(currentProduct.image) || 'https://via.placeholder.com/500x300?text=No+Image'}
                                            alt={currentProduct.name}
                                            className="img-fluid rounded shadow"
                                            style={{ 
                                                maxHeight: '300px',
                                                width: '100%',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/500x300?text=Image+Error';
                                            }}
                                        />
                                        
                                        {/* পণ্যের তথ্য */}
                                        <div className="hero-product-info position-absolute bottom-0 start-0 w-100 p-3 text-start"
                                             style={{
                                                 background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                             }}>
                                            <h4 className="text-white mb-1">{currentProduct.name}</h4>
                                            <p className="text-light mb-2" style={{ fontSize: '0.9rem' }}>
                                                {currentProduct.category?.name || 'সাধারণ ক্যাটাগরি'}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="text-warning mb-0">
                                                    ৳{currentProduct.price?.toLocaleString('bn-BD') || '0'}
                                                </h5>
                                                <Link 
                                                    to={`/product/${currentProduct.id}`}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    বিস্তারিত দেখুন
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        {/* ✅ Navigation Buttons */}
                                        <button 
                                            className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y"
                                            onClick={prevProduct}
                                            style={{ left: '10px' }}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                        <button 
                                            className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y"
                                            onClick={nextProduct}
                                            style={{ right: '10px' }}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                        
                                        {/* ✅ Image Counter */}
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <span className="badge bg-dark bg-opacity-75">
                                                {currentProductIndex + 1} / {heroProducts.length}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    // ✅ যদি কোনো পণ্য না থাকে
                                    <div className="text-center py-5">
                                        <i className="bi bi-image display-1 text-light opacity-50"></i>
                                        <p className="text-light mt-3">Admin প্যানেলে পণ্য যোগ করুন</p>
                                        <Link to={`${API_BASE_URL}/admin`} 
                                              className="btn btn-outline-light btn-sm">
                                            <i className="bi bi-gear me-1"></i>
                                            Admin Panel
                                        </Link>
                                    </div>
                                )}
                                
                                {/* ✅ Product Dots Indicator */}
                                {heroProducts.length > 1 && (
                                    <div className="d-flex justify-content-center mt-3">
                                        {heroProducts.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`btn btn-sm mx-1 ${index === currentProductIndex ? 'btn-light' : 'btn-outline-light'}`}
                                                onClick={() => setCurrentProductIndex(index)}
                                                style={{ 
                                                    width: '10px', 
                                                    height: '10px', 
                                                    borderRadius: '50%',
                                                    padding: 0
                                                }}
                                                aria-label={`Product ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* বাকি কোড একই থাকবে */}
            <div className="container mt-5">
                {/* স্ট্যাটাস বার */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm text-center h-100 bg-light">
                            <div className="card-body">
                                <div className="display-6 text-primary mb-2">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <h3 className="card-title">{products.length}</h3>
                                <p className="card-text text-muted">মোট পণ্য</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm text-center h-100 bg-light">
                            <div className="card-body">
                                <div className="display-6 text-success mb-2">
                                    <i className="bi bi-tags"></i>
                                </div>
                                <h3 className="card-title">{categories.length}</h3>
                                <p className="card-text text-muted">ক্যাটাগরি</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm text-center h-100 bg-light">
                            <div className="card-body">
                                <div className="display-6 text-warning mb-2">
                                    <i className="bi bi-truck"></i>
                                </div>
                                <h3 className="card-title">ফ্রি</h3>
                                <p className="card-text text-muted">ডেলিভারি</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ক্যাটাগরি সেকশন */}
                <div className="section-title mb-4">
                    <h2 className="fw-bold">
                        <i className="bi bi-grid me-2"></i>
                        আমাদের ক্যাটাগরি সমূহ
                        <span className="badge bg-primary ms-2">{categories.length}</span>
                    </h2>
                    <p className="text-muted">আপনার পছন্দের ক্যাটাগরি থেকে পণ্য নির্বাচন করুন</p>
                </div>
                
                {categories.length === 0 ? (
                    <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        কোনো ক্যাটাগরি পাওয়া যায়নি। অ্যাডমিন প্যানেল থেকে ক্যাটাগরি যোগ করুন।
                        <div className="mt-2">
                            <a 
                                href={`${API_BASE_URL}/admin/`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-primary me-2"
                            >
                                <i className="bi bi-gear me-1"></i>
                                অ্যাডমিন প্যানেল
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="row mb-5">
                        {categories.map(category => (
                            <div key={category.id} className="col-lg-2 col-md-3 col-sm-4 col-6 mb-3">
                                <Link 
                                    to={`/category/${category.slug || category.id}`}
                                    className="card category-card text-center h-100 border-0 shadow-sm text-decoration-none"
                                >
                                    <div className="card-body">
                                        <div className="category-icon mb-3 text-primary" style={{ fontSize: '2rem' }}>
                                            <i className="bi bi-basket"></i>
                                        </div>
                                        <h6 className="card-title mb-2 text-dark fw-semibold">
                                            {category.name}
                                        </h6>
                                        <small className="text-muted">
                                            {category.product_count || 'পণ্য দেখুন'}
                                        </small>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0">
                                        <span className="badge bg-primary rounded-pill">
                                            <i className="bi bi-arrow-right"></i>
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* পণ্য ট্যাবস */}
                <div className="section-title mb-4">
                    <h2 className="fw-bold">
                        <i className="bi bi-star me-2"></i>
                        সেরা পণ্য সমূহ
                        <span className="badge bg-success ms-2">{filteredProducts.length}</span>
                    </h2>
                </div>
                
                {/* পণ্য ফিল্টার ট্যাবস */}
                <div className="mb-4">
                    <ul className="nav nav-tabs" id="productTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                <i className="bi bi-grid-3x3 me-1"></i>
                                সব পণ্য
                                <span className="badge bg-secondary ms-1">{products.length}</span>
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'featured' ? 'active' : ''}`}
                                onClick={() => setActiveTab('featured')}
                            >
                                <i className="bi bi-star me-1"></i>
                                বিশেষ অফার
                                <span className="badge bg-warning ms-1">
                                    {products.filter(p => p.featured).length}
                                </span>
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
                                onClick={() => setActiveTab('new')}
                            >
                                <i className="bi bi-clock-history me-1"></i>
                                নতুন পণ্য
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'discount' ? 'active' : ''}`}
                                onClick={() => setActiveTab('discount')}
                            >
                                <i className="bi bi-percent me-1"></i>
                                ডিসকাউন্ট
                                <span className="badge bg-danger ms-1">
                                    {products.filter(p => p.discount_price && p.discount_price < p.price).length}
                                </span>
                            </button>
                        </li>
                    </ul>
                </div>
                
                {/* পণ্য গ্রিড */}
                {filteredProducts.length === 0 ? (
                    <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>{activeTab === 'all' ? 'কোনো পণ্য' : 
                               activeTab === 'featured' ? 'কোনো বিশেষ পণ্য' : 
                               activeTab === 'new' ? 'কোনো নতুন পণ্য' : 'কোনো ডিসকাউন্ট পণ্য'} পাওয়া যায়নি।</strong>
                        <div className="mt-2">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={fetchData}>
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                রিফ্রেশ করুন
                            </button>
                            <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('all')}>
                                <i className="bi bi-grid me-1"></i>
                                সব পণ্য দেখুন
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="col">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
                
                {/* ফুটার সেকশন */}
                <div className="mt-5 pt-4 border-top text-center">
                    <p className="text-muted mb-2">
                        <small>
                            <i className="bi bi-shield-check text-success me-1"></i>
                            ১০০% অথেন্টিক অর্গানিক পণ্য
                        </small>
                    </p>
                    <div className="d-flex justify-content-center gap-3 mb-3">
                        <span className="text-success">
                            <i className="bi bi-truck"></i> ফ্রি হোম ডেলিভারি
                        </span>
                        <span className="text-primary">
                            <i className="bi bi-arrow-repeat"></i> ৭ দিন রিটার্ন
                        </span>
                        <span className="text-warning">
                            <i className="bi bi-shield-check"></i> গ্যারান্টিযুক্ত
                        </span>
                    </div>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={fetchData}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        লিস্ট আপডেট করুন
                    </button>
                </div>
            </div>
            
            {/* CSS স্টাইলস */}
            <style jsx>{`
                .hero-section {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                }
                
                .hero-slider-container {
                    position: relative;
                }
                
                .hero-product-wrapper {
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    transition: all 0.5s ease;
                }
                
                .hero-product-wrapper:hover {
                    transform: scale(1.02);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                }
                
                .hero-product-info {
                    border-radius: 0 0 15px 15px;
                }
                
                .category-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .category-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                
                .category-icon {
                    transition: transform 0.3s ease;
                }
                
                .category-card:hover .category-icon {
                    transform: scale(1.2);
                }
                
                .nav-tabs .nav-link {
                    transition: all 0.3s ease;
                }
                
                .nav-tabs .nav-link.active {
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default Home;