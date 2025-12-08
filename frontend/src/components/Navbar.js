import React, { useState, useEffect } from 'react'; // ✅ useEffect যোগ করুন
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ cartItemsCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // ✅ Bootstrap JS manually initialize করার জন্য
    useEffect(() => {
        // Bootstrap components initialize
        if (typeof window !== 'undefined') {
            // Bootstrap এর JavaScript components initialize
            const navbarToggler = document.querySelector('.navbar-toggler');
            if (navbarToggler) {
                console.log('✅ Navbar toggler found in DOM');
            }
            
            // Bootstrap tooltip, popover ইত্যাদি initialize করতে চাইলে
            // const { Tooltip, Popover } = window.bootstrap;
            // if (Tooltip) {
            //     const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            //     tooltipTriggerList.map(function (tooltipTriggerEl) {
            //         return new Tooltip(tooltipTriggerEl);
            //     });
            // }
        }
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow fixed-top">
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-bold" to="/" onClick={() => setIsOpen(false)}>
                    <i className="bi bi-shop me-2"></i>
                    অর্গানিক বাজার
                </Link>
                
                {/* Hamburger Button - Bootstrap compatible */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                {/* Collapsible Menu */}
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`} 
                                to="/"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-house-door me-1"></i>
                                হোম
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/products' ? 'active fw-bold' : ''}`} 
                                to="/products"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-box-seam me-1"></i>
                                পণ্য
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname.includes('/category') ? 'active fw-bold' : ''}`} 
                                to="/categories"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-tags me-1"></i>
                                ক্যাটাগরি
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/cart' ? 'active fw-bold' : ''}`} 
                                to="/cart"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-cart3 me-1"></i>
                                কার্ট
                                {cartItemsCount > 0 && (
                                    <span className="badge bg-danger ms-1">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/about' ? 'active fw-bold' : ''}`} 
                                to="/about"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-info-circle me-1"></i>
                                আমাদের সম্পর্কে
                            </Link>
                        </li>
                    </ul>
                    
                    {/* Search Form */}
                    <form className="d-flex">
                        <div className="input-group input-group-sm">
                            <input 
                                type="search" 
                                className="form-control" 
                                placeholder="পণ্য খুঁজুন..."
                            />
                            <button className="btn btn-light" type="submit">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Custom CSS */}
            <style jsx>{`
                .navbar {
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                }
                
                .navbar-brand {
                    font-size: 1.5rem;
                }
                
                @media (max-width: 991.98px) {
                    .navbar-collapse {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        z-index: 1000;
                        background: white;
                        padding: 1rem;
                        border-radius: 0 0 10px 10px;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    }
                    
                    .navbar-dark .navbar-collapse .nav-link {
                        color: #333 !important;
                        padding: 0.75rem 0;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .navbar-dark .navbar-collapse .nav-link:last-child {
                        border-bottom: none;
                    }
                    
                    .navbar-dark .navbar-collapse .nav-link.active {
                        color: #0d6efd !important;
                        font-weight: 600;
                    }
                    
                    .navbar-collapse.show {
                        animation: slideDown 0.3s ease;
                    }
                    
                    @keyframes slideDown {
                        from { 
                            opacity: 0; 
                            transform: translateY(-10px); 
                        }
                        to { 
                            opacity: 1; 
                            transform: translateY(0); 
                        }
                    }
                }
                
                .navbar-toggler:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
                }
                
                .nav-link {
                    transition: all 0.3s ease;
                }
                
                .nav-link:hover {
                    transform: translateY(-2px);
                }
            `}</style>
        </nav>
    );
};

export default Navbar;