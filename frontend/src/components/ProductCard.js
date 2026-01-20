import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    // ইমেজ URL তৈরি
    const getImageUrl = () => {
        if (product.image_url && product.image_url.startsWith('http')) {
            return product.image_url;
        }
        
        if (product.image) {
            const imagePath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
            return `https://organic.satbeta.top/media/${imagePath}`;
        }
        
        if (product.image) {
            return `https://organic.satbeta.top${product.image}`;
        }
        
        return 'https://via.placeholder.com/300x200.png?text=No+Image';
    };
    
    const imageUrl = getImageUrl();
    
    return (
        <div className="card h-100 shadow-sm hover-shadow" style={{
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '1px solid #e0e0e0'
        }}>
            <div 
                className="position-relative" 
                style={{ 
                    height: '200px', 
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa'
                }}
            >
                <img 
                    src={imageUrl} 
                    className="card-img-top" 
                    alt={product.name || 'Product Image'}
                    style={{ 
                        height: '100%', 
                        width: '100%', 
                        objectFit: 'contain',
                        padding: '10px'
                    }}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200.png?text=Image+Not+Found';
                        e.target.style.objectFit = 'cover';
                        e.target.style.padding = '0';
                    }}
                />
                
                {!product.available && (
                    <div className="position-absolute top-0 start-0 bg-danger text-white p-2" 
                         style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                        No Stock
                    </div>
                )}
                
                {product.featured && (
                    <div className="position-absolute top-0 end-0 bg-warning text-dark p-2" 
                         style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <i className="bi bi-star-fill me-1"></i>
                        Special
                    </div>
                )}
            </div>
            
            <div className="card-body d-flex flex-column p-3">
                <h6 className="card-title fw-bold mb-2" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '48px',
                    color: '#333'
                }}>
                    {product.name || 'পণ্যের নাম নেই'}
                </h6>
                
                {/* ✅ পরিমাণ দেখানো হয়েছে */}
                <div className="quantity-unit mb-2">
                    <span className="badge bg-info text-dark">
                        <i className="bi bi-box me-1"></i>
                        {product.quantity_unit || '1 kg'}
                    </span>
                </div>
                
                <div className="price-section mb-2">
                    <h5 className="text-primary fw-bold mb-0">
                        ৳{product.price ? product.price.toLocaleString('bn-BD') : '0'}
                    </h5>
                    {/*
                    <small className="text-muted">পরিমাণ প্রতি</small>
                    */}
                </div>
                
                <p className="card-text text-muted mb-3 flex-grow-1" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '0.85rem',
                    minHeight: '63px'
                }}>
                    {product.description || 'পণ্যের বিবরণ নেই।'}
                </p>
                
                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="stock-info">
                            <span className={`badge ${product.available ? 'bg-success' : 'bg-danger'} me-2`}>
                                {product.available ? 'In Stock' : 'Not Available'}
                            </span>
                            {product.stock > 0 && (
                                <span className="badge bg-secondary">
                                    Stock: {product.stock || 0}
                                </span>
                            )}
                        </div>
                        
                        <Link 
                            to={`/product/${product.id}`} 
                            className="btn btn-primary btn-sm px-3"
                            style={{ 
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}
                        >
                            Details
                        </Link>
                    </div>
                    
                    {product.category && (
                        <div className="category-section mt-2 pt-2 border-top">
                            <small className="text-muted d-block mb-1">Category:</small>
                            <span className="badge bg-light text-dark border px-3 py-1" 
                                  style={{ fontSize: '0.8rem' }}>
                                {product.category.name || 'General'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .hover-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                
                .card-img-top {
                    transition: transform 0.5s ease;
                }
                
                .card:hover .card-img-top {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default ProductCard;