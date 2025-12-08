import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const CategoryProducts = () => {
    const { slug } = useParams(); // URL থেকে category slug নিবে
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    
    useEffect(() => {
        fetchData();
    }, [slug]); // slug পরিবর্তন হলে আবার ফেচ করবে
    
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // ১. সব ক্যাটাগরি লোড
            const categoriesResponse = await axios.get('http://127.0.0.1:8000/api/categories/');
            const categoriesData = categoriesResponse.data.results || categoriesResponse.data;
            setAllCategories(Array.isArray(categoriesData) ? categoriesData : []);
            
            // ২. বর্তমান ক্যাটাগরি খুঁজে বের করা
            const currentCategory = categoriesData.find(cat => cat.slug === slug);
            
            if (!currentCategory) {
                setError('ক্যাটাগরি পাওয়া যায়নি।');
                setLoading(false);
                return;
            }
            
            setCategory(currentCategory);
            
            // ৩. এই ক্যাটাগরির পণ্য ফেচ করা
            // উপায় ১: API এর by_category এন্ডপয়েন্ট ব্যবহার
            try {
                const productsResponse = await axios.get(`http://127.0.0.1:8000/api/products/by_category/?category_slug=${slug}`);
                
                if (productsResponse.data.results) {
                    setProducts(productsResponse.data.results);
                } else if (Array.isArray(productsResponse.data)) {
                    setProducts(productsResponse.data);
                } else {
                    setProducts([]);
                }
            } catch (apiError) {
                // উপায় ২: সরাসরি ফিল্টার করে (যদি by_category না থাকে)
                console.log('Trying alternative method...');
                const allProductsResponse = await axios.get('http://127.0.0.1:8000/api/products/');
                const allProducts = allProductsResponse.data.results || allProductsResponse.data;
                
                if (Array.isArray(allProducts)) {
                    const filteredProducts = allProducts.filter(product => 
                        product.category && product.category.slug === slug
                    );
                    setProducts(filteredProducts);
                } else {
                    setProducts([]);
                }
            }
            
            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching category products:', err);
            setError('এই ক্যাটাগরির পণ্য লোড করতে সমস্যা হচ্ছে।');
            setProducts([]);
            setLoading(false);
        }
    };
    
    const handleCategoryChange = (newSlug) => {
        navigate(`/category/${newSlug}`);
    };
    
    // লোডিং স্টেট
    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">লোড হচ্ছে...</span>
                </div>
                <p className="mt-3">পণ্য লোড হচ্ছে...</p>
            </div>
        );
    }
    
    // এরর স্টেট
    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4>এরর!</h4>
                    <p>{error}</p>
                    <div className="mt-3">
                        <Link to="/" className="btn btn-primary">
                            হোমপেজে ফিরে যান
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mt-4">
            {/* ব্রেডক্রাম্ব */}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">হোম</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {category?.name || 'ক্যাটাগরি'}
                    </li>
                </ol>
            </nav>
            
            {/* হেডার */}
            <div className="card bg-light mb-4">
                <div className="card-body">
                    <h1 className="display-6">{category?.name}</h1>
                    <p className="lead">
                        {category?.name} ক্যাটাগরির সব পণ্য ({products.length} টি)
                    </p>
                </div>
            </div>
            
            {/* অন্যান্য ক্যাটাগরির বাটন */}
            <h4 className="mb-3">অন্যান্য ক্যাটাগরি</h4>
            <div className="row mb-4">
                {allCategories.map(cat => (
                    <div key={cat.id} className="col-md-2 col-sm-4 col-6 mb-2">
                        <button
                            onClick={() => handleCategoryChange(cat.slug)}
                            className={`btn btn-block w-100 ${cat.slug === slug ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                            {cat.name}
                        </button>
                    </div>
                ))}
            </div>
            
            {/* পণ্য লিস্ট */}
            <h4 className="mb-3">{category?.name} - সব পণ্য</h4>
            
            {products.length === 0 ? (
                <div className="alert alert-warning">
                    <p>এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।</p>
                    <Link to="/" className="btn btn-sm btn-primary">
                        সব পণ্য দেখুন
                    </Link>
                </div>
            ) : (
                <>
                    <div className="row mb-3">
                        <div className="col">
                            <div className="alert alert-info py-2">
                                <span className="badge bg-primary me-2">{products.length}</span>
                                টি পণ্য পাওয়া গেছে
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        {products.map(product => (
                            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {/* ব্যাক বাটন */}
            <div className="mt-4">
                <Link to="/" className="btn btn-outline-secondary">
                    ← হোমপেজে ফিরে যান
                </Link>
            </div>
        </div>
    );
};

export default CategoryProducts;