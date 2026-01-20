import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('-created');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
useEffect(() => {
    // ✅ All products পেজে ঢুকলে সরাসরি শুরুতে চলে যাবে
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    fetchAllProducts();
    fetchCategories();
}, [sortBy, selectedCategory, priceRange]);
    
    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let apiUrl = `${API_BASE_URL}/api/products/`;
            const params = [];
            
            if (selectedCategory) {
                params.push(`category=${selectedCategory}`);
            }
            
            params.push(`ordering=${sortBy}`);
            
            if (priceRange.min) {
                params.push(`price__gte=${priceRange.min}`);
            }
            
            if (priceRange.max) {
                params.push(`price__lte=${priceRange.max}`);
            }
            
            if (params.length > 0) {
                apiUrl += '?' + params.join('&');
            }
            
            console.log('Fetching products from:', apiUrl);
            
            const response = await axios.get(apiUrl, {
                headers: { 'Accept': 'application/json' }
            });
            
            let productsData = [];
            if (response.data.results) {
                productsData = response.data.results;
            } else if (Array.isArray(response.data)) {
                productsData = response.data;
            }
            
            setProducts(productsData);
            setLoading(false);
            
        } catch (error) {
            console.error('Error fetching all products:', error);
            setError('পণ্য লোড করতে সমস্যা হয়েছে।');
            setLoading(false);
        }
    };
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/categories/`);
            let categoriesData = [];
            
            if (response.data.results) {
                categoriesData = response.data.results;
            } else if (Array.isArray(response.data)) {
                categoriesData = response.data;
            }
            
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };
    
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };
    
    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };
    
    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setSortBy('-created');
    };
    
    if (loading) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">loading...</span>
                </div>
                <p className="mt-3">পণ্য লোড হচ্ছে...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>Error!</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchAllProducts}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mt-4">
            {/* ব্রেডক্রাম্ব */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">All Products</li>
                </ol>
            </nav>
            
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
                            
                            {/* ক্যাটাগরি */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Category</label>
                                <select 
                                    className="form-select" 
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} ({category.product_count || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* প্রাইস রেঞ্জ */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Price Range</label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="Minimum"
                                            value={priceRange.min}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="Maximum"
                                            value={priceRange.max}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* ফিল্টার রিসেট */}
                            {(selectedCategory || priceRange.min || priceRange.max || sortBy !== '-created') && (
                                <button 
                                    className="btn btn-outline-secondary w-100"
                                    onClick={clearFilters}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* পণ্য লিস্ট */}
                <div className="col-lg-9">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold mb-0">
                            <i className="bi bi-box-seam me-2"></i>
                            All Products
                            <span className="badge bg-primary ms-2">{products.length}</span>
                        </h2>
                        
                        <div className="text-muted">
                            {selectedCategory ? 'Filtered Products' : 'All Products'}
                        </div>
                    </div>
                    
                    {products.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <div className="display-1 text-muted mb-4">
                                    <i className="bi bi-box"></i>
                                </div>
                                <h4 className="text-muted mb-3">No products found</h4>
                                <p className="text-muted mb-4">
                                    {selectedCategory || priceRange.min || priceRange.max 
                                        ? 'ফিল্টারের সাথে মিলে এমন কোনো পণ্য নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।'
                                        : 'বর্তমানে কোনো পণ্য নেই।'}
                                </p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={clearFilters}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Reset Filters
                                </button>
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
                            
                            {/* পণ্য কাউন্ট */}
                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="text-muted">
                                        দেখানো হচ্ছে: <strong>{products.length}</strong> টি পণ্য
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

export default AllProducts;