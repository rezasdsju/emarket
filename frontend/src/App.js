import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import CategoryProducts from './components/CategoryProducts';
import SearchResults from './components/SearchResults';
import AllProducts from './components/AllProducts';
import About from './components/About';
import AdminLogin from './components/AdminLogin';

function App() {
    const [cartItems, setCartItems] = useState([]);
    
    useEffect(() => {
        const savedCart = localStorage.getItem('ghorerbazar_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                setCartItems([]);
            }
        }
    }, []);
    
    useEffect(() => {
        try {
            localStorage.setItem('ghorerbazar_cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cartItems]);
    
    const addToCart = (product, quantity = 1) => {
        if (!product || !product.id) {
            console.error('Invalid product data');
            return;
        }
        
        const existingItem = cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item.id === product.id
                    ? { 
                        ...item, 
                        quantity: item.quantity + quantity,
                        price: parseFloat(product.price)
                    }
                    : item
            ));
        } else {
            const newItem = {
                id: product.id,
                name: product.name || 'Unknown Product',
                price: parseFloat(product.price) || 0,
                image: product.image_url || 
                      (product.image ? `https://organic.satbeta.top${product.image}` : 
                      'https://via.placeholder.com/300x200?text=No+Image'),
                quantity: Math.max(1, quantity),
                product: product
            };
            
            setCartItems([...cartItems, newItem]);
        }
    };
    
    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.id !== productId));
    };
    
    const updateQuantity = (productId, quantity) => {
        setCartItems(cartItems.map(item =>
            item.id === productId
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
        ));
    };
    
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('ghorerbazar_cart');
    };
    
    const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    
    return (
        <Router>
            <div className="App">
                <Navbar cartItemsCount={cartItemsCount} />
                
                <div className="pt-5">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<AllProducts />} />
                        <Route path="/categories" element={<CategoryProducts />} />
                        <Route path="/category/:slug" element={<CategoryProducts />} />
                        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
                        <Route path="/cart" element={
                            <Cart 
                                cartItems={cartItems}
                                removeFromCart={removeFromCart}
                                updateQuantity={updateQuantity}
                                clearCart={clearCart}
                            />
                        } />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        
                        <Route path="*" element={
                            <div className="container mt-5 text-center">
                                <h1>404 - Page Not Found</h1>
                                <p>The page you are looking for does not exist.</p>
                                <a href="/" className="btn btn-primary mt-3">Go to Homepage</a>
                            </div>
                        } />
                    </Routes>
                </div>
                
                {/* ফুটার - আগের মতো সম্পূর্ণ রাখা হয়েছে */}
                <footer className="bg-dark text-white mt-5 py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-4">
                                <h5>Shohoz Shop</h5>
                                <p>Organic and healthy food products.</p>
                                <div className="d-flex gap-2">
                                    <span className="badge bg-primary">Products: 100+</span>
                                    <span className="badge bg-success">Customers: 500+</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <h5>Contact</h5>
                                <p className="mb-1">
                                    <i className="bi bi-envelope me-2"></i>
                                    support@organicbazar.com
                                </p>
                                <p className="mb-1">
                                    <i className="bi bi-telephone me-2"></i>
                                    01795468672
                                </p>
                                <p className="mb-1">
                                    <i className="bi bi-geo-alt me-2"></i>
                                    Savar, Dhaka, Bangladesh
                                </p>
                            </div>
                            <div className="col-md-4">
                                <h5>Important Links</h5>
                                <ul className="list-unstyled">
                                    <li className="mb-1">
                                        <a href="#privacy" className="text-white text-decoration-none">
                                            <i className="bi bi-shield-check me-1"></i>
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li className="mb-1">
                                        <a href="#terms" className="text-white text-decoration-none">
                                            <i className="bi bi-file-text me-1"></i>
                                            Terms and Conditions
                                        </a>
                                    </li>
                                    <li className="mb-1">
                                        <a href="#return" className="text-white text-decoration-none">
                                            <i className="bi bi-arrow-return-left me-1"></i>
                                            Return Policy
                                        </a>
                                    </li>
                                    <li className="mb-1">
                                        <a href="#shipping" className="text-white text-decoration-none">
                                            <i className="bi bi-truck me-1"></i>
                                            Shipping Policy
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <hr className="bg-light my-3" />
                        
                        {/* Payment Methods */}
                        <div className="row">
                            <div className="col-12">
                                <h6 className="text-center mb-3">Supported Payment Methods</h6>
                                <div className="d-flex justify-content-center gap-3">
                                    <div className="bg-white p-2 rounded">
                                        <span className="text-dark fw-bold">bKash</span>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <span className="text-dark fw-bold">Rocket</span>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <span className="text-dark fw-bold">Nagad</span>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <span className="text-dark fw-bold">Card</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <hr className="bg-light my-3" />
                        
                        <p className="text-center mb-0">
                            &copy; {new Date().getFullYear()} Shohoz Shop. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;