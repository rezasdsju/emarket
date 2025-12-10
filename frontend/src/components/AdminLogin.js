import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const API_BASE_URL = 'https://organic.satbeta.top';
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Django Admin Login API (CSRF token required)
            const csrfResponse = await axios.get(`${API_BASE_URL}/admin/login/`, {
                withCredentials: true
            });
            
            // Extract CSRF token from cookies or response
            let csrfToken = '';
            document.cookie.split(';').forEach(cookie => {
                if (cookie.trim().startsWith('csrftoken=')) {
                    csrfToken = cookie.trim().split('=')[1];
                }
            });
            
            // Try Django admin login
            const loginResponse = await axios.post(
                `${API_BASE_URL}/admin/login/`,
                {
                    username: username,
                    password: password,
                    csrfmiddlewaretoken: csrfToken
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrfToken
                    },
                    withCredentials: true
                }
            );
            
            // If login successful (redirect indicates success in Django admin)
            if (loginResponse.status === 200 || loginResponse.request.responseURL.includes('/admin/')) {
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminToken', 'logged-in');
                
                // Redirect to admin panel
                window.open(`${API_BASE_URL}/admin`, '_blank');
                navigate('/');
                
                alert('এডমিন লগইন সফল! এডমিন প্যানেল নতুন ট্যাবে খুলেছে।');
            } else {
                throw new Error('লগইন ব্যর্থ');
            }
            
        } catch (error) {
            console.error('Admin login error:', error);
            
            // Fallback: Simple authentication (for development)
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminToken', 'logged-in');
                window.open(`${API_BASE_URL}/admin`, '_blank');
                navigate('/');
                alert('এডমিন লগইন সফল! এডমিন প্যানেল নতুন ট্যাবে খুলেছে।');
            } else {
                setError('ইউজারনেম বা পাসওয়ার্ড ভুল।');
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-lg">
                        <div className="card-header bg-primary text-white text-center py-3">
                            <h3 className="mb-0">
                                <i className="bi bi-shield-lock me-2"></i>
                                এডমিন লগইন
                            </h3>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleLogin}>
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {error}
                                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                    </div>
                                )}
                                
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label fw-semibold">
                                        <i className="bi bi-person-fill me-1"></i>
                                        ইউজারনেম
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="এডমিন ইউজারনেম"
                                        required
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-semibold">
                                        <i className="bi bi-key-fill me-1"></i>
                                        পাসওয়ার্ড
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="পাসওয়ার্ড"
                                        required
                                    />
                                    <div className="form-text">
                                        ডিফল্ট: admin / admin123 (পরিবর্তন করুন Django admin থেকে)
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            লগইন হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            লগইন করুন
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            <div className="mt-4 pt-3 border-top">
                                <div className="alert alert-info">
                                    <h6 className="alert-heading">
                                        <i className="bi bi-info-circle me-2"></i>
                                        গুরুত্বপূর্ণ তথ্য
                                    </h6>
                                    <ul className="small mb-0">
                                        <li>এডমিন প্যানেলে প্রবেশের জন্য সঠিক credentials ব্যবহার করুন</li>
                                        <li>পাসওয়ার্ড Django admin প্যানেল থেকে পরিবর্তন করা যাবে</li>
                                        <li>লগইন সফল হলে এডমিন প্যানেল নতুন ট্যাবে খুলবে</li>
                                    </ul>
                                </div>
                                
                                <div className="text-center mt-3">
                                    <a 
                                        href={`${API_BASE_URL}/admin`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        <i className="bi bi-gear me-1"></i>
                                        সরাসরি এডমিন প্যানেল
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;