import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ cartItemsCount }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow fixed-top">
            <div className="container">
                <Link className="navbar-brand" to="/">অর্গানিক বাজার</Link>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">হোম</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/cart">
                                কার্ট ({cartItemsCount})
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">আমাদের সম্পর্কে</Link>
                        </li>
                    </ul>
                    
                    <form className="d-flex">
                        <input 
                            className="form-control me-2" 
                            type="search" 
                            placeholder="পণ্য খুঁজুন..."
                        />
                        <button className="btn btn-light" type="submit">খুঁজুন</button>
                    </form>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;