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
import AllProducts from './components/AllProducts';  // ✅ নতুন
import About from './components/About';  // ✅ নতুন
import AdminLogin from './components/AdminLogin';  // ✅ নতুন

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
                        <Route path="/products" element={<AllProducts />} />  {/* ✅ নতুন */}
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
                        <Route path="/about" element={<About />} />  {/* ✅ নতুন */}
                        <Route path="/admin/login" element={<AdminLogin />} />  {/* ✅ নতুন */}
                        
                        <Route path="*" element={
                            <div className="container mt-5 text-center">
                                <h1>404 - পৃষ্ঠা পাওয়া যায়নি</h1>
                                <p>আপনার চাওয়া পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।</p>
                                <a href="/" className="btn btn-primary mt-3">হোমপেজে ফিরে যান</a>
                            </div>
                        } />
                    </Routes>
                </div>
                
                {/* Footer - আগের মতই থাকবে */}
                <footer className="bg-dark text-white mt-5 py-4">
                    <div className="container">
                        {/* Footer content... */}
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;