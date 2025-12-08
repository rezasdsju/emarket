import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Cart = ({ cartItems, removeFromCart, updateQuantity, clearCart }) => {
    const [showPayment, setShowPayment] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('কার্ট খালি! কিছু পণ্য যোগ করুন।');
            return;
        }
        
        // গ্রাহকের তথ্য চাওয়া হবে
        setShowCustomerForm(true);
    };
    
    const handleCustomerSubmit = async () => {
        // ভ্যালিডেশন চেক
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            alert('নাম, ফোন এবং ঠিকানা আবশ্যক');
            return;
        }
        
        if (customerInfo.phone.length < 11) {
            alert('সঠিক মোবাইল নম্বর দিন (11 ডিজিট)');
            return;
        }
        
        setLoading(true);
        
        try {
            // ১. Backend-এ অর্ডার তৈরি
            const orderData = {
                name: customerInfo.name,
                email: customerInfo.email || 'no-email@example.com',
                phone: customerInfo.phone,
                address: customerInfo.address,
                total_price: calculateTotal(), // Temporary, backend will calculate
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };
            
            console.log('Sending order data:', orderData);
            
            const orderResponse = await axios.post(
                'http://127.0.0.1:8000/api/orders/',
                orderData
            );
            
            console.log('Order created:', orderResponse.data);
            
            // ২. অর্ডার সেভ করে পেমেন্ট পেজ দেখান
            setCurrentOrder(orderResponse.data);
            setShowCustomerForm(false);
            setShowPayment(true);
            
        } catch (error) {
            console.error('Order creation error:', error.response || error);
            alert('অর্ডার তৈরি করতে সমস্যা হয়েছে। সার্ভার চেক করুন।');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePaymentSuccess = () => {
        alert('🎉 অর্ডার সফলভাবে কনফার্ম হয়েছে! ধন্যবাদ।');
        
        // কার্ট খালি করুন
        if (clearCart) {
            clearCart();
        }
        
        // সব স্টেট রিসেট করুন
        setShowPayment(false);
        setCurrentOrder(null);
        setCustomerInfo({
            name: '',
            email: '',
            phone: '',
            address: ''
        });
    };
    
    const handlePaymentCancel = () => {
        setShowPayment(false);
        setCurrentOrder(null);
        setShowCustomerForm(false);
    };
    
    // যদি পেমেন্ট পেজ দেখাতে হয়
    if (showPayment && currentOrder) {
        return (
            <div className="container mt-4">
                <div className="card">
                    <div className="card-body">
                        <h3 className="text-success">অর্ডার কনফার্মেশন</h3>
                        <div className="alert alert-success">
                            <h5>অর্ডার সফলভাবে তৈরি হয়েছে!</h5>
                            <p><strong>অর্ডার নং:</strong> #{currentOrder.id}</p>
                            <p><strong>গ্রাহক:</strong> {currentOrder.name}</p>
                            <p><strong>মোট:</strong> ৳{currentOrder.total_price}</p>
                        </div>
                        
                        <div className="card mb-3">
                            <div className="card-header">
                                <h5>পেমেন্ট ইনস্ট্রাকশন</h5>
                            </div>
                            <div className="card-body">
                                <h6>নিচের যেকোনো উপায়ে পেমেন্ট করুন:</h6>
                                
                                <div className="row mt-3">
                                    <div className="col-md-4 mb-3">
                                        <div className="card border-primary">
                                            <div className="card-body text-center">
                                                <h5>bKash</h5>
                                                <p className="mb-1">মার্চেন্ট: 017XXXXXXXX</p>
                                                <p className="mb-1">Amount: ৳{currentOrder.total_price}</p>
                                                <p className="mb-1">Reference: ORD{currentOrder.id}</p>
                                                <small className="text-muted">পেমেন্ট করে সেলসিয়াল নম্বর পাঠান</small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-4 mb-3">
                                        <div className="card border-info">
                                            <div className="card-body text-center">
                                                <h5>Rocket</h5>
                                                <p className="mb-1">মার্চেন্ট: 017XXXXXXXX</p>
                                                <p className="mb-1">Amount: ৳{currentOrder.total_price}</p>
                                                <p className="mb-1">Reference: ORD{currentOrder.id}</p>
                                                <small className="text-muted">পেমেন্ট করে সেলসিয়াল নম্বর পাঠান</small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-4 mb-3">
                                        <div className="card border-warning">
                                            <div className="card-body text-center">
                                                <h5>Nagad</h5>
                                                <p className="mb-1">মার্চেন্ট: 017XXXXXXXX</p>
                                                <p className="mb-1">Amount: ৳{currentOrder.total_price}</p>
                                                <p className="mb-1">Reference: ORD{currentOrder.id}</p>
                                                <small className="text-muted">পেমেন্ট করে সেলসিয়াল নম্বর পাঠান</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="alert alert-info">
                                    <strong>নোট:</strong> পেমেন্ট করার পর আপনার অর্ডারটি কনফার্ম হবে।
                                    আমাদের টিম আপনাকে কল করবে পেমেন্ট ভেরিফাই করার জন্য।
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-success"
                                onClick={handlePaymentSuccess}
                            >
                                পেমেন্ট সম্পন্ন হয়েছে
                            </button>
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={handlePaymentCancel}
                            >
                                অর্ডার বাতিল করুন
                            </button>
                            <Link to="/" className="btn btn-primary">
                                হোমপেজে যান
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // গ্রাহক ফর্ম দেখানো
    if (showCustomerForm) {
        return (
            <div className="container mt-4">
                <div className="card">
                    <div className="card-body">
                        <h3>গ্রাহকের তথ্য</h3>
                        <p className="text-muted">অর্ডার সম্পন্ন করতে আপনার তথ্য দিন</p>
                        
                        <div className="mb-3">
                            <label className="form-label">পূর্ণ নাম *</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({
                                    ...customerInfo, 
                                    name: e.target.value
                                })}
                                placeholder="আপনার পূর্ণ নাম"
                                required
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">মোবাইল নম্বর *</label>
                            <input 
                                type="tel" 
                                className="form-control"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({
                                    ...customerInfo, 
                                    phone: e.target.value
                                })}
                                placeholder="01XXXXXXXXX"
                                required
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">ইমেইল (ঐচ্ছিক)</label>
                            <input 
                                type="email" 
                                className="form-control"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({
                                    ...customerInfo, 
                                    email: e.target.value
                                })}
                                placeholder="you@example.com"
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">ডেলিভারি ঠিকানা *</label>
                            <textarea 
                                className="form-control"
                                value={customerInfo.address}
                                onChange={(e) => setCustomerInfo({
                                    ...customerInfo, 
                                    address: e.target.value
                                })}
                                placeholder="বিস্তারিত ঠিকানা"
                                rows="3"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <h5>অর্ডার সামারি</h5>
                            <div className="card">
                                <div className="card-body">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="d-flex justify-content-between mb-2">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>৳{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <h5>মোট</h5>
                                        <h5 className="text-primary">৳{calculateTotal()}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-success"
                                onClick={handleCustomerSubmit}
                                disabled={loading}
                            >
                                {loading ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}
                            </button>
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={() => setShowCustomerForm(false)}
                                disabled={loading}
                            >
                                পিছনে
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // মূল কার্ট পেজ (যদি খালি থাকে)
    if (cartItems.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <h3>আপনার কার্ট খালি</h3>
                <p>কিছু পণ্য যোগ করুন কার্টে</p>
                <Link to="/" className="btn btn-primary">
                    শপিং চালিয়ে যান
                </Link>
            </div>
        );
    }
    
    // মূল কার্ট পেজ
    return (
        <div className="container mt-4">
            <h2>আপনার শপিং কার্ট</h2>
            <div className="row">
                <div className="col-md-8">
                    {cartItems.map(item => (
                        <div key={item.id} className="card mb-3">
                            <div className="row g-0">
                                <div className="col-md-3">
                                    <img 
                                        src={item.image} 
                                        className="img-fluid rounded-start" 
                                        alt={item.name}
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-9">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="card-title">{item.name}</h5>
                                                <p className="text-primary fw-bold">৳{item.price}</p>
                                            </div>
                                            <div>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    মুছুন
                                                </button>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center mt-3">
                                            <span className="me-3">পরিমাণ:</span>
                                            <div className="input-group" style={{ width: '150px' }}>
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number" 
                                                    className="form-control form-control-sm text-center" 
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                                    min="1"
                                                />
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="ms-4">
                                                <strong>মোট: ৳{item.price * item.quantity}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">অর্ডার সামারি</h5>
                            <hr />
                            {cartItems.map(item => (
                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>৳{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <h5>মোট</h5>
                                <h5 className="text-primary">৳{calculateTotal()}</h5>
                            </div>
                            <button 
                                className="btn btn-success w-100 mt-3"
                                onClick={handleCheckout}
                            >
                                চেকআউট করুন
                            </button>
                            <Link to="/" className="btn btn-outline-primary w-100 mt-2">
                                আরো পণ্য দেখুন
                            </Link>
                            <button 
                                className="btn btn-outline-danger w-100 mt-2"
                                onClick={clearCart}
                            >
                                কার্ট খালি করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;