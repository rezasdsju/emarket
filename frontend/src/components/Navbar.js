import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ cartItemsCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is admin
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
        navigate('/');
        setIsOpen(false);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow fixed-top">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/" onClick={() => setIsOpen(false)}>
                    <i className="bi bi-shop me-2"></i>
                    Shohoz Shop
                </Link>
                
                <div className="d-none d-lg-flex align-items-center" style={{ flexGrow: 1, maxWidth: '400px', margin: '0 20px' }}>
                    <form onSubmit={handleSearch} className="w-100">
                        <div className="input-group">
                            <input 
                                type="search" 
                                className="form-control" 
                                placeholder="পণ্য খুঁজুন (যেমন: মধু, কিচমিচ, আখরোট, বাদাম, খেজুর...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    borderRight: 'none',
                                    borderRadius: '20px 0 0 20px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button 
                                className="btn btn-light" 
                                type="submit"
                                style={{ 
                                    borderRadius: '0 20px 20px 0',
                                    paddingLeft: '15px',
                                    paddingRight: '15px'
                                }}
                            >
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="d-lg-none me-2">
                    <button 
                        className="btn btn-outline-light"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mobileSearch"
                        aria-expanded="false"
                        aria-controls="mobileSearch"
                        onClick={() => {
                            const navbarCollapse = document.getElementById('navbarNav');
                            if (navbarCollapse.classList.contains('show')) {
                                navbarCollapse.classList.remove('show');
                            }
                        }}
                    >
                        <i className="bi bi-search"></i>
                    </button>
                </div>
                
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
                
                <div className="collapse" id="mobileSearch">
                    <div className="container py-2 d-lg-none">
                        <form onSubmit={handleSearch} className="d-flex">
                            <div className="input-group">
                                <input 
                                    type="search" 
                                    className="form-control" 
                                    placeholder="পণ্য খুঁজুন..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-light" type="submit">
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`} 
                                to="/"
                                onClick={() => {
                                    setIsOpen(false);
                                    const mobileSearch = document.getElementById('mobileSearch');
                                    if (mobileSearch.classList.contains('show')) {
                                        mobileSearch.classList.remove('show');
                                    }
                                }}
                            >
                                <i className="bi bi-house-door me-1"></i>
                                Home
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/products' ? 'active fw-bold' : ''}`} 
                                to="/products"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-box-seam me-1"></i>
                                Products
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname.includes('/category') || location.pathname === '/categories' ? 'active fw-bold' : ''}`} 
                                to="/categories"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-tags me-1"></i>
                                Categories
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/cart' ? 'active fw-bold' : ''}`} 
                                to="/cart"
                                onClick={() => setIsOpen(false)}
                            >
                                <i className="bi bi-cart3 me-1"></i>
                                Cart
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
                                About us 
                            </Link>
                        </li>
                        
                        {/* ✅ এডমিন লিংক */}
                        {isAdmin ? (
                            <>
                                <li className="nav-item">
                                    <a 
                                        className="nav-link text-warning"
                                        href="https://organic.satbeta.top/admin"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <i className="bi bi-gear me-1"></i>
                                        Admin Panel
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="nav-link text-danger"
                                        onClick={handleLogout}
                                        style={{ background: 'none', border: 'none' }}
                                    >
                                        <i className="bi bi-box-arrow-right me-1"></i>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link 
                                    className="nav-link text-info"
                                    to="/admin/login"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className="bi bi-person-circle me-1"></i>
                                    Admin Login
                                </Link>
                            </li>
                        )}
                    </ul>
                    
                    <div className="d-none d-lg-flex align-items-center">
                        <Link 
                            to="/cart" 
                            className="nav-link text-white position-relative"
                            title="Shopping Cart"
                            onClick={() => setIsOpen(false)}
                        >
                            <i className="bi bi-cart3 fs-5"></i>
                            {cartItemsCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {cartItemsCount}
                                    <span className="visually-hidden">Cart items</span>
                                </span>
                            )}
                        </Link>
                    </div>
                    
                    <div className="d-lg-none mt-3">
                        <div className="card">
                            <div className="card-body p-2">
                                <p className="small text-muted mb-2">Quick Search:</p>
                                <div className="d-flex flex-wrap gap-1">
                                    {['মধু', 'কিচমিচ', 'আখরোট', 'বাদাম', 'খেজুর'].map((term) => (
                                        <button
                                            key={term}
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                setSearchTerm(term);
                                                navigate(`/search?q=${encodeURIComponent(term)}`);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;