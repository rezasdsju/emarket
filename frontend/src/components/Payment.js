import React, { useState } from 'react';
import axios from 'axios';

const Payment = ({ order, onPaymentSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handlePayment = async () => {
        if (!mobileNumber || mobileNumber.length < 11) {
            alert('সঠিক মোবাইল নম্বর দিন (11 ডিজিট)');
            return;
        }
        
        setLoading(true);
        
        try {
            // ১. Backend-এ payment তৈরি
            const paymentData = {
                order_id: order.id,
                amount: order.total_price,
                payment_method: paymentMethod,
                mobile_number: mobileNumber
            };
            
            const response = await axios.post(
                'http://127.0.0.1:8000/api/payments/',
                paymentData
            );
            
            const payment = response.data;
            
            // ২. ব্যবহারকারীকে পেমেন্ট নির্দেশনা দেখান
            alert(`
                পেমেন্ট ইনস্ট্রাকশন:
                ১. আপনার ${paymentMethod === 'bkash' ? 'bKash' : 'Rocket'} অ্যাপ খুলুন
                ২. Send Money এ ক্লিক করুন
                ৩. নম্বর: 017XXXXXXXX (আপনার মার্চেন্ট নম্বর)
                ৪. Amount: ৳${order.total_price}
                ৫. Reference: ${payment.transaction_id}
                
                পেমেন্ট শেষ হলে OK ক্লিক করুন
            `);
            
            // ৩. পেমেন্ট সফল হলে Callback
            if (onPaymentSuccess) {
                onPaymentSuccess(payment);
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('পেমেন্ট প্রসেস করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    <h3>পেমেন্ট অপশন</h3>
                    
                    <div className="mb-3">
                        <label className="form-label">পেমেন্ট মেথড</label>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className={`btn ${paymentMethod === 'bkash' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setPaymentMethod('bkash')}
                            >
                                bKash
                            </button>
                            <button
                                type="button"
                                className={`btn ${paymentMethod === 'rocket' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setPaymentMethod('rocket')}
                            >
                                Rocket
                            </button>
                            <button
                                type="button"
                                className={`btn ${paymentMethod === 'nagad' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setPaymentMethod('nagad')}
                            >
                                Nagad
                            </button>
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">
                            {paymentMethod === 'bkash' ? 'bKash' : 
                             paymentMethod === 'rocket' ? 'Rocket' : 'Nagad'} মোবাইল নম্বর
                        </label>
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="01XXXXXXXXX"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    </div>
                    
                    <div className="mb-3">
                        <h5>অর্ডার সুমারি</h5>
                        <p>মোট: ৳{order.total_price}</p>
                        <p>অর্ডার নং: #{order.id}</p>
                    </div>
                    
                    <button
                        className="btn btn-success w-100"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'প্রসেসিং...' : 'পেমেন্ট করুন'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;