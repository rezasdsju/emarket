import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // ১. পণ্য ফেচ
            const productsResponse = await axios.get('http://127.0.0.1:8000/api/products/');
            
            // API পেজিনেশন আছে, তাই .results নিতে হবে
            console.log("Products API Response:", productsResponse.data);
            
            if (productsResponse.data.results) {
                // পেজিনেশন আছে: results ব্যবহার করুন
                setProducts(productsResponse.data.results);
                console.log(`পণ্য পাওয়া গেছে: ${productsResponse.data.results.length} টি`);
            } else if (Array.isArray(productsResponse.data)) {
                // সরাসরি অ্যারে (পেজিনেশন বন্ধ থাকলে)
                setProducts(productsResponse.data);
                console.log(`পণ্য পাওয়া গেছে: ${productsResponse.data.length} টি`);
            } else {
                // অন্য কোনো ফরম্যাট
                console.warn("অপেক্ষিত API রেসপন্স ফরম্যাট");
                setProducts([]);
            }
            
            // ২. ক্যাটাগরি ফেচ
            const categoriesResponse = await axios.get('http://127.0.0.1:8000/api/categories/');
            
            console.log("Categories API Response:", categoriesResponse.data);
            
            if (categoriesResponse.data.results) {
                // পেজিনেশন আছে: results ব্যবহার করুন
                setCategories(categoriesResponse.data.results);
                console.log(`ক্যাটাগরি পাওয়া গেছে: ${categoriesResponse.data.results.length} টি`);
            } else if (Array.isArray(categoriesResponse.data)) {
                // সরাসরি অ্যারে
                setCategories(categoriesResponse.data);
                console.log(`ক্যাটাগরি পাওয়া গেছে: ${categoriesResponse.data.length} টি`);
            } else {
                console.warn("অপেক্ষিত API রেসপন্স ফরম্যাট");
                setCategories([]);
            }
            
            setLoading(false);
            
        } catch (err) {
            console.error('ডেটা লোড করতে সমস্যা:', err);
            setError('ডেটা লোড করতে সমস্যা হচ্ছে। সার্ভার চেক করুন।');
            setProducts([]);
            setCategories([]);
            setLoading(false);
        }
    };
    
    // লোডিং স্টেট
    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">লোড হচ্ছে...</span>
                </div>
                <p className="mt-3">পণ্য লোড হচ্ছে...</p>
                <p className="text-muted">API: http://127.0.0.1:8000/api/products/</p>
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
                        <button className="btn btn-primary me-2" onClick={fetchData}>
                            আবার চেষ্টা করুন
                        </button>
                        <a href="http://127.0.0.1:8000/api/products/" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="btn btn-outline-primary">
                            API সরাসরি দেখুন
                        </a>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mt-4">
            <div className="jumbotron bg-light p-5 rounded">
                <h1 className="display-4"> অর্গানিক বাজারে স্বাগতম!</h1>
                <p className="lead">সেরা দামে সেরা পণ্য কিনুন আপনার ঘরে বসেই</p>
                <div className="mt-3">
                    <span className="badge bg-success me-2">
                        পণ্য: {products.length} টি
                    </span>
                    <span className="badge bg-info">
                        ক্যাটাগরি: {categories.length} টি
                    </span>
                </div>
            </div>
            
            {/* ক্যাটাগরি সেকশন */}
            <h3 className="my-4">ক্যাটাগরি ({categories.length})</h3>
            {categories.length === 0 ? (
                <div className="alert alert-warning">
                    কোনো ক্যাটাগরি পাওয়া যায়নি। অ্যাডমিন থেকে ক্যাটাগরি যোগ করুন।
                </div>
            ) : (
                <div className="row mb-4">
                    {categories.map(category => (
                        <div key={category.id} className="col-md-2 col-sm-4 col-6 mb-2">
                            <Link 
                                to={`/category/${category.slug}`}
                                className="btn btn-outline-primary btn-block w-100"
                            >
                                {category.name}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            
            {/* পণ্য সেকশন */}
            <h3 className="my-4">সব পণ্য ({products.length})</h3>
            {products.length === 0 ? (
                <div className="alert alert-warning">
                    <p>কোনো পণ্য পাওয়া যায়নি।</p>
                    <div className="mt-2">
                        <a href="http://127.0.0.1:8000/admin/" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="btn btn-sm btn-primary me-2">
                            অ্যাডমিন থেকে যোগ করুন
                        </a>
                        <button className="btn btn-sm btn-outline-primary" onClick={fetchData}>
                            রিফ্রেশ করুন
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {products.map(product => (
                        <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
            
            {/* ডিবাগ ইনফো (শুধু ডেভেলপমেন্টে) */}
            {/*
            <div className="mt-5 pt-4 border-top text-muted small">
                <p className="mb-1">
                    <strong>API Endpoints:</strong>
                </p>
                <ul className="list-unstyled mb-1">
                    <li>• পণ্য: <code>http://127.0.0.1:8000/api/products/</code></li>
                    <li>• ক্যাটাগরি: <code>http://127.0.0.1:8000/api/categories/</code></li>
                    <li>• অ্যাডমিন: <code>http://127.0.0.1:8000/admin/</code></li>
                </ul>
                <p className="mb-0">
                    <em>API পেজিনেশন ব্যবহার করছে। পণ্যগুলো <code>.results</code> প্রপার্টিতে আছে।</em>
                </p>
            </div>
            */}
        </div>
    );
};

export default Home;