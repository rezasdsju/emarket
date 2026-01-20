import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const CategoryProducts = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [sortBy, setSortBy] = useState('-created');
    const [isCategoryPage, setIsCategoryPage] = useState(false);
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // পেজ লোড হলে উপরে চলে যাবে
    
        // চেক করি এটি শুধু ক্যাটাগরি লিস্ট পৃষ্ঠা নাকি নির্দিষ্ট ক্যাটাগরির পণ্য পৃষ্ঠা
        setIsCategoryPage(!slug);
        
        if (slug) {
            // নির্দিষ্ট ক্যাটাগরির পণ্য লোড করবে
            fetchSpecificCategoryProducts();
        } else {
            // সব ক্যাটাগরি লিস্ট লোড করবে
            fetchAllCategories();
        }
    }, [slug, sortBy]); // slug বা sortBy পরিবর্তন হলে আবার ফেচ করবে
    
    const fetchSpecificCategoryProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(`Loading products for category slug: ${slug}`);
            
            // ১. প্রথমে সব ক্যাটাগরি লোড করি
            const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories/`);
            let categoriesData = [];
            
            if (categoriesResponse.data.results) {
                categoriesData = categoriesResponse.data.results;
            } else if (Array.isArray(categoriesResponse.data)) {
                categoriesData = categoriesResponse.data;
            }
            
            setAllCategories(categoriesData);
            
            // ২. বর্তমান ক্যাটাগরি খুঁজে বের করা
            const currentCategory = categoriesData.find(cat => 
                cat.slug === slug || cat.id.toString() === slug
            );
            
            if (!currentCategory) {
                setError('ক্যাটাগরি পাওয়া যায়নি।');
                setLoading(false);
                return;
            }
            
            setCategory(currentCategory);
            console.log('Current category found:', currentCategory);
            
            // ৩. এই ক্যাটাগরির পণ্য ফেচ করা
            let apiUrl = `${API_BASE_URL}/api/products/?category=${currentCategory.id}`;
            
            // সর্টিং প্যারামিটার যোগ
            if (sortBy) {
                apiUrl += `&ordering=${sortBy}`;
            }
            
            console.log('Fetching products from:', apiUrl);
            
            const productsResponse = await axios.get(apiUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 10000
            });
            
            let productsData = [];
            if (productsResponse.data.results) {
                productsData = productsResponse.data.results;
            } else if (Array.isArray(productsResponse.data)) {
                productsData = productsResponse.data;
            } else if (productsResponse.data && productsResponse.data.products) {
                productsData = productsResponse.data.products;
            }
            
            console.log(`Found ${productsData.length} products for category`);
            setProducts(productsData);
            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching specific category products:', err);
            
            let errorMessage = 'এই ক্যাটাগরির পণ্য লোড করতে সমস্যা হচ্ছে।';
            
            if (err.response) {
                console.error('Error Response:', err.response);
                if (err.response.status === 404) {
                    errorMessage = 'ক্যাটাগরি পাওয়া যায়নি।';
                }
            }
            
            setError(errorMessage);
            setProducts([]);
            setLoading(false);
        }
    };
    
    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading all categories...');
            
            const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories/`, {
                headers: { 'Accept': 'application/json' },
                timeout: 10000
            });
            
            let categoriesData = [];
            
            if (categoriesResponse.data.results) {
                categoriesData = categoriesResponse.data.results;
            } else if (Array.isArray(categoriesResponse.data)) {
                categoriesData = categoriesResponse.data;
            }
            
            console.log(`Found ${categoriesData.length} categories`);
            setAllCategories(categoriesData);
            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('ক্যাটাগরি লোড করতে সমস্যা হচ্ছে।');
            setLoading(false);
        }
    };
    
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };
    
const handleCategoryClick = (categorySlug) => {
    // ✅ এই লাইন যোগ করুন
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/category/${categorySlug}`);
};
    
    // লোডিং স্টেট
    if (loading) {
        return (
            <div className="container mt-5 py-5 text-center">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">loading...</span>
                </div>
                <p className="mt-3 fs-5">
                    {slug ? `${category?.name || 'ক্যাটাগরি'} লোড হচ্ছে...` : 'ক্যাটাগরি লোড হচ্ছে...'}
                </p>
                <div className="progress mt-3" style={{ height: '4px', maxWidth: '300px', margin: '0 auto' }}>
                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div>
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
                        Fail to load Data!
                    </h4>
                    <p>{error}</p>
                    <hr />
                    <div className="d-flex flex-wrap gap-2">
                        <Link to="/" className="btn btn-primary">
                            <i className="bi bi-house me-1"></i>
                            Go to HomePage
                        </Link>
                        <button className="btn btn-outline-primary" onClick={slug ? fetchSpecificCategoryProducts : fetchAllCategories}>
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Try Again
                        </button>
                        <Link to="/categories" className="btn btn-outline-secondary">
                            <i className="bi bi-tags me-1"></i>
                            List of Categories
                        </Link>
                    </div>
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            </div>
        );
    }
    
    // যদি slug না থাকে (সব ক্যাটাগরি পৃষ্ঠা)
    if (isCategoryPage) {
        return (
            <div className="container mt-4">
                {/* ব্রেডক্রাম্ব */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/" className="text-decoration-none">
                                <i className="bi bi-house me-1"></i>
                                Home
                            </Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            <strong>All Categories</strong>
                        </li>
                    </ol>
                </nav>
                
                {/* হেডার সেকশন */}
                <div className="category-header bg-gradient-light rounded-3 p-4 mb-4 shadow-sm">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="display-6 fw-bold text-primary mb-2">
                                <i className="bi bi-tags me-2"></i>
                                Our Categories
                            </h1>
                            <p className="lead mb-3">
                                আপনার পছন্দের ক্যাটাগরি থেকে পণ্য নির্বাচন করুন
                            </p>
                            <div className="d-flex flex-wrap gap-3 align-items-center">
                                <span className="badge bg-primary fs-6 py-2 px-3">
                                    <i className="bi bi-tags me-1"></i>
                                    {allCategories.length} Categories
                                </span>
                                <span className="badge bg-info fs-6 py-2 px-3">
                                    <i className="bi bi-box-seam me-1"></i>
                                    100+ Products
                                </span>
                            </div>
                        </div>
                        <div className="col-md-4 text-center">
                            <div className="category-icon display-1 text-primary opacity-50">
                                <i className="bi bi-grid-3x3-gap"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ক্যাটাগরি গ্রিড */}
                {allCategories.length === 0 ? (
                    <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>No Categories Found.</strong>
                        <div className="mt-2">
                            <Link to="/" className="btn btn-sm btn-outline-primary me-2">
                                <i className="bi bi-house me-1"></i>
                                Home
                            </Link>
                            <button className="btn btn-sm btn-primary" onClick={fetchAllCategories}>
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ক্যাটাগরি কাউন্টার */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="alert alert-light border d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="badge bg-primary rounded-pill me-2">
                                            <i className="bi bi-tags"></i>
                                        </span>
                                        <strong>{allCategories.length}</strong> টি ক্যাটাগরি পাওয়া গেছে
                                    </div>
                                    <div className="text-muted small">
                                        Click and View Products
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* ক্যাটাগরি কার্ডস */}
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                            {allCategories.map(cat => (
                                <div key={cat.id} className="col">
                                    <div 
                                        className="card category-card h-100 border-0 shadow-sm"
                                        style={{ 
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onClick={() => handleCategoryClick(cat.slug || cat.id)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        <div className="card-body text-center p-4">
                                            <div className="category-icon mb-3 text-primary" style={{ fontSize: '3rem' }}>
                                                <i className="bi bi-basket"></i>
                                            </div>
                                            <h5 className="card-title fw-bold mb-2 text-dark">
                                                {cat.name}
                                            </h5>
                                            <div className="category-meta mb-3">
                                                <span className="badge bg-light text-dark border">
                                                    <i className="bi bi-box-seam me-1"></i>
                                                    {cat.product_count || '০'} Products
                                                </span>
                                            </div>
                                            <div className="text-muted small mb-3">
                                                পণ্য দেখতে ক্লিক করুন
                                            </div>
                                        </div>
                                        <div className="card-footer bg-transparent border-top-0 text-center pb-3">
                                            <span className="badge bg-primary rounded-pill px-3 py-2">
                                                <i className="bi bi-arrow-right me-1"></i>
                                                View Products
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* ব্যাক টু হোম */}
                        <div className="mt-5 pt-4 border-top text-center">
                            <div className="d-flex flex-wrap justify-content-center gap-3">
                                <Link to="/" className="btn btn-outline-secondary">
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Go to Home
                                </Link>
                                <Link to="/products" className="btn btn-outline-primary">
                                    <i className="bi bi-box-seam me-1"></i>
                                    View All Products
                                </Link>
                                <Link to="/search" className="btn btn-primary">
                                    <i className="bi bi-search me-1"></i>
                                    Search Products
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
    
    // যদি slug থাকে (নির্দিষ্ট ক্যাটাগরির পণ্য)
    return (
        <div className="container mt-4">
            {/* ব্রেডক্রাম্ব */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/" className="text-decoration-none">
                            <i className="bi bi-house me-1"></i>
                            Home
                        </Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/categories" className="text-decoration-none">
                            Categories
                        </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        <strong>{category?.name}</strong>
                    </li>
                </ol>
            </nav>
            
            {/* ক্যাটাগরি হেডার */}
            <div className="category-detail-header bg-gradient-primary text-white rounded-3 p-4 mb-4 shadow-sm">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="display-6 fw-bold mb-2">
                            <i className="bi bi-tag me-2"></i>
                            {category?.name}
                        </h1>
                        <p className="lead mb-3 opacity-90">
                            {category?.description || `${category?.name} ক্যাটাগরির সেরা পণ্যসমূহ`}
                        </p>
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                            <span className="badge bg-light text-dark fs-6 py-2 px-3">
                                <i className="bi bi-box-seam me-1"></i>
                                {products.length} টি পণ্য
                            </span>
                            <span className="badge bg-warning fs-6 py-2 px-3">
                                <i className="bi bi-star me-1"></i>
                                Special Offers
                            </span>
                        </div>
                    </div>
                    <div className="col-md-4 text-center">
                        <div className="category-icon display-1 text-white opacity-50">
                            <i className="bi bi-basket"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="row">
                {/* ফিল্টার সাইডবার */}
                <div className="col-lg-3 mb-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-funnel me-2"></i>
                                Filter
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* সর্টিং */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Sort</label>
                                <select 
                                    className="form-select" 
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <option value="-created">New First</option>
                                    <option value="created">Old First</option>
                                    <option value="price">Price: Low to High</option>
                                    <option value="-price">Price: High to Low</option>
                                    <option value="name">Name: A-Z</option>
                                    <option value="-name">Name: Z-A</option>
                                </select>
                            </div>
                            
                            {/* অন্যান্য ক্যাটাগরি */}
                            {allCategories.length > 1 && (
                                <div className="mb-4">
                                    <h6 className="border-bottom pb-2 mb-3">Other Categories</h6>
                                    <div className="list-group list-group-flush">
                                        {allCategories
                                            .filter(cat => cat.id !== category.id)
                                            .slice(0, 6)
                                            .map(cat => (
                                                <button
                                                    key={cat.id}
                                                    className="list-group-item list-group-item-action border-0 d-flex justify-content-between align-items-center"
                                                    onClick={() => handleCategoryClick(cat.slug || cat.id)}
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    <div>
                                                        <i className="bi bi-arrow-right-circle me-2 text-primary"></i>
                                                        {cat.name}
                                                    </div>
                                                    <span className="badge bg-secondary rounded-pill">
                                                        {cat.product_count || 0}
                                                    </span>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* ব্যাক বাটন */}
                            <div className="mt-3">
                                <Link to="/categories" className="btn btn-outline-primary w-100">
                                    <i className="bi bi-arrow-left me-1"></i>
                                    View All Categories
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* পণ্য লিস্ট */}
                <div className="col-lg-9">
                    {products.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="display-1 text-muted mb-4">
                                    <i className="bi bi-box"></i>
                                </div>
                                <h4 className="text-muted mb-3">কোনো পণ্য পাওয়া যায়নি</h4>
                                <p className="text-muted mb-4">
                                    এই ক্যাটাগরিতে এখনো কোনো পণ্য যোগ করা হয়নি।
                                </p>
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    <Link to="/categories" className="btn btn-primary">
                                        <i className="bi bi-arrow-left me-1"></i>
                                        ক্যাটাগরি তালিকা
                                    </Link>
                                    <Link to="/products" className="btn btn-outline-primary">
                                        <i className="bi bi-box-seam me-1"></i>
                                        View All Products
                                    </Link>
                                    <button className="btn btn-outline-secondary" onClick={fetchSpecificCategoryProducts}>
                                        <i className="bi bi-arrow-clockwise me-1"></i>
                                        Try Again
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
                            
                            {/* পণ্য স্ট্যাটাস */}
                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="text-muted">
                                        Total Products: <strong>{products.length}</strong>
                                    </div>
                                    <div className="text-muted">
                                        Sort: {
                                            sortBy === '-created' ? 'New First' :
                                            sortBy === 'created' ? 'Old First' :
                                            sortBy === 'price' ? 'Price: Low to High' :
                                            sortBy === '-price' ? 'Price: High to Low' :
                                            sortBy === 'name' ? 'Name: A-Z' : 'Name: Z-A'
                                        }
                                    </div>
                                </div> 
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {/* ডিবাগ তথ্য (যদি ডেভেলপমেন্টে থাকে) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-5 pt-4 border-top text-muted small">
                    <details>
                        <summary className="mb-2">
                            <strong>ডিবাগ তথ্য (Development Only)</strong>
                        </summary>
                        <ul className="list-unstyled mb-1">
                            <li>• <strong>Category Slug:</strong> {slug}</li>
                            <li>• <strong>Category ID:</strong> {category?.id}</li>
                            <li>• <strong>Category Name:</strong> {category?.name}</li>
                            <li>• <strong>Products Count:</strong> {products.length}</li>
                            <li>• <strong>Sort By:</strong> {sortBy}</li>
                            <li>• <strong>Is Category Page:</strong> {isCategoryPage ? 'Yes' : 'No'}</li>
                        </ul>
                    </details>
                </div>
            )}
            
            {/* CSS স্টাইলস */}
            <style jsx>{`
                .category-detail-header {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                }
                
                .category-card {
                    transition: all 0.3s ease;
                }
                
                .category-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default CategoryProducts;