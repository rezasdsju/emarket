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
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    useEffect(() => {
        if (slug) {
            fetchCategoryProducts();
        } else {
            fetchAllCategories();
        }
    }, [slug, sortBy]);
    
    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // ১. ক্যাটাগরি ডেটা ফেচ
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
            
            // ৩. এই ক্যাটাগরির পণ্য ফেচ করা
            let apiUrl = `${API_BASE_URL}/api/products/?category=${currentCategory.id}`;
            
            // সর্টিং প্যারামিটার যোগ
            if (sortBy) {
                apiUrl += `&ordering=${sortBy}`;
            }
            
            const productsResponse = await axios.get(apiUrl);
            
            let productsData = [];
            if (productsResponse.data.results) {
                productsData = productsResponse.data.results;
            } else if (Array.isArray(productsResponse.data)) {
                productsData = productsResponse.data;
            }
            
            setProducts(productsData);
            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching category products:', err);
            setError('এই ক্যাটাগরির পণ্য লোড করতে সমস্যা হচ্ছে।');
            setLoading(false);
        }
    };
    
    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            
            const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories/`);
            let categoriesData = [];
            
            if (categoriesResponse.data.results) {
                categoriesData = categoriesResponse.data.results;
            } else if (Array.isArray(categoriesResponse.data)) {
                categoriesData = categoriesResponse.data;
            }
            
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
        navigate(`/category/${categorySlug}`);
    };
    
    if (loading) {
        return (
            <div className="container mt-5 py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">লোড হচ্ছে...</span>
                </div>
                <p className="mt-3">
                    {slug ? `${category?.name || 'ক্যাটাগরি'} লোড হচ্ছে...` : 'ক্যাটাগরি লোড হচ্ছে...'}
                </p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>এরর!</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={slug ? fetchCategoryProducts : fetchAllCategories}>
                        আবার চেষ্টা করুন
                    </button>
                </div>
            </div>
        );
    }
    
    // যদি slug না থাকে (সব ক্যাটাগরি পৃষ্ঠা)
    if (!slug) {
        return (
            <div className="container mt-4">
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">হোম</Link></li>
                        <li className="breadcrumb-item active">সব ক্যাটাগরি</li>
                    </ol>
                </nav>
                
                <h1 className="fw-bold mb-4">
                    <i className="bi bi-tags me-2"></i>
                    সব ক্যাটাগরি
                    <span className="badge bg-primary ms-2">{allCategories.length}</span>
                </h1>
                
                {allCategories.length === 0 ? (
                    <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        কোনো ক্যাটাগরি পাওয়া যায়নি।
                    </div>
                ) : (
                    <div className="row">
                        {allCategories.map(cat => (
                            <div key={cat.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                                <div 
                                    className="card h-100 shadow-sm border-0"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleCategoryClick(cat.slug || cat.id)}
                                >
                                    <div className="card-body text-center">
                                        <div className="category-icon mb-3 text-primary" style={{ fontSize: '3rem' }}>
                                            <i className="bi bi-basket"></i>
                                        </div>
                                        <h5 className="card-title fw-bold">{cat.name}</h5>
                                        <p className="text-muted">
                                            {cat.product_count || 0} টি পণ্য
                                        </p>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0 text-center">
                                        <span className="badge bg-primary rounded-pill px-3 py-2">
                                            পণ্য দেখুন <i className="bi bi-arrow-right ms-1"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    // যদি slug থাকে (নির্দিষ্ট ক্যাটাগরির পণ্য)
    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">হোম</Link></li>
                    <li className="breadcrumb-item"><Link to="/categories">ক্যাটাগরি</Link></li>
                    <li className="breadcrumb-item active">{category?.name}</li>
                </ol>
            </nav>
            
            <div className="row">
                <div className="col-lg-3 mb-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-funnel me-2"></i>
                                ফিল্টার
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label className="form-label fw-semibold">সর্ট করুন</label>
                                <select 
                                    className="form-select" 
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <option value="-created">নতুন আগে</option>
                                    <option value="created">পুরনো আগে</option>
                                    <option value="price">দাম: কম থেকে বেশি</option>
                                    <option value="-price">দাম: বেশি থেকে কম</option>
                                    <option value="name">নাম: A-Z</option>
                                    <option value="-name">নাম: Z-A</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <h6 className="border-bottom pb-2">অন্যান্য ক্যাটাগরি</h6>
                                <div className="list-group list-group-flush">
                                    {allCategories
                                        .filter(cat => cat.id !== category.id)
                                        .slice(0, 5)
                                        .map(cat => (
                                            <button
                                                key={cat.id}
                                                className="list-group-item list-group-item-action border-0"
                                                onClick={() => handleCategoryClick(cat.slug || cat.id)}
                                            >
                                                <i className="bi bi-arrow-right-circle me-2 text-primary"></i>
                                                {cat.name}
                                                <span className="badge bg-secondary float-end">
                                                    {cat.product_count || 0}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-9">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="fw-bold mb-0">
                                <i className="bi bi-tag me-2"></i>
                                {category?.name}
                            </h1>
                            <p className="text-muted mb-0">
                                {products.length} টি পণ্য পাওয়া গেছে
                            </p>
                        </div>
                        
                        <Link to="/categories" className="btn btn-outline-primary">
                            <i className="bi bi-arrow-left me-1"></i>
                            সব ক্যাটাগরি
                        </Link>
                    </div>
                    
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
                                <Link to="/categories" className="btn btn-primary">
                                    <i className="bi bi-arrow-left me-1"></i>
                                    ক্যাটাগরি তালিকা
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                                {products.map(product => (
                                    <div key={product.id} className="col">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="text-muted">
                                        মোট পণ্য: <strong>{products.length}</strong>
                                    </div>
                                    <div className="text-muted">
                                        সর্ট: {
                                            sortBy === '-created' ? 'নতুন আগে' :
                                            sortBy === 'created' ? 'পুরনো আগে' :
                                            sortBy === 'price' ? 'দাম: কম থেকে বেশি' :
                                            sortBy === '-price' ? 'দাম: বেশি থেকে কম' :
                                            sortBy === 'name' ? 'নাম: A-Z' : 'নাম: Z-A'
                                        }
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryProducts;