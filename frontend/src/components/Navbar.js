import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ cartItemsCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow fixed-top">
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-bold" to="/" onClick={() => setIsOpen(false)}>
                    <i className="bi bi-shop me-2"></i>
                    অর্গানিক বাজার
                </Link>
                
                {/* Hamburger Button - React State ব্যবহার */}
                <button 
                    className="navbar-toggler border-0" 
                    type="button" 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                {/* Collapsible Menu */}
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
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
                @media (max-width: 991.98px) {
                    .navbar-collapse {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        z-index: 1000;
                        background: white;
                    }
                    .navbar-collapse.show {
                        animation: slideDown 0.3s ease;
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                }
                .navbar-toggler:focus {
                    outline: none;
                    box-shadow: none;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;