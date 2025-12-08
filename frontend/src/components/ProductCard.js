import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // ইমেজ URL তৈরি
    const imageUrl = product.image_url || 
                    (product.image ? `http://127.0.0.1:8000${product.image}` : '');
    
    return (
        <div className="card h-100 shadow-sm hover-shadow">
            <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                <img 
                    src={imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    className="card-img-top img-cover" 
                    alt={product.name}
                    style={{ 
                        height: '100%', 
                        width: '100%', 
                        objectFit: 'cover' 
                    }}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                    }}
                />
                {!product.available && (
                    <div className="position-absolute top-0 start-0 bg-danger text-white p-1 small">
                        স্টক নেই
                    </div>
                )}
            </div>
            
            <div className="card-body d-flex flex-column">
                <h5 className="card-title" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {product.name}
                </h5>
                
                <p className="card-text text-muted flex-grow-1" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '0.9rem'
                }}>
                    {product.description || 'কোনো বর্ণনা নেই'}
                </p>
                
                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="text-primary mb-0">৳{product.price}</h5>
                        <Link 
                            to={`/product/${product.id}`} 
                            className="btn btn-primary btn-sm"
                        >
                            বিস্তারিত
                        </Link>
                    </div>
                    
                    <div className="d-flex justify-content-between small">
                        <span className={`badge ${product.available ? 'bg-success' : 'bg-danger'}`}>
                            {product.available ? 'ইন স্টক' : 'স্টক নেই'}
                        </span>
                        <span className="badge bg-secondary">
                            স্টক: {product.stock}
                        </span>
                    </div>
                    
                    {product.category && (
                        <div className="mt-2 small">
                            <span className="text-muted">ক্যাটাগরি: </span>
                            <span className="badge bg-light text-dark border">
                                {product.category.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;