import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Row, Col, Card, Button, Form,
    Table, Modal, Alert, Spinner, Tab, Nav,
    Badge, InputGroup, FormControl, Dropdown,
    DropdownButton, Pagination, ProgressBar
} from 'react-bootstrap';
import {
    FaPlus, FaEdit, FaTrash, FaEye, FaSave,
    FaTimes, FaSignOutAlt, FaLock, FaChartBar,
    FaBox, FaTag, FaImage, FaUpload, FaSearch,
    FaPercent, FaTags, FaCalendarAlt, FaToggleOn,
    FaToggleOff, FaFilter, FaSortAmountDown,
    FaSortAmountUp, FaFire, FaDollarSign
} from 'react-icons/fa';

const API_BASE_URL = 'https://organic.satbeta.top/api';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('products');
    const [user, setUser] = useState(null);
    
    // Login state
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });
    
    // Products state
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        slug: '',
        category_id: '',
        price: '',
        quantity_unit: '1 kg',
        description: '',
        stock: 10,
        available: true,
        featured: false,
        image: null,
        // Discount fields
        discount_type: 'none',
        discount_value: 0,
        discount_active: true,
        discount_start_date: '',
        discount_end_date: ''
    });
    const [productImagePreview, setProductImagePreview] = useState('');
    
    // Categories state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: ''
    });
    
    // Change password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    
    // Dashboard stats
    const [stats, setStats] = useState({
        total_products: 0,
        total_categories: 0,
        active_products: 0,
        featured_products: 0,
        discounted_products: 0,
        discount_percentage: 0
    });
    
    // Discount management
    const [discountStats, setDiscountStats] = useState({
        with_discount: 0,
        without_discount: 0,
        active_discounts: 0,
        expired_discounts: 0,
        avg_discount: 0
    });
    const [showBulkDiscountModal, setShowBulkDiscountModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkDiscountForm, setBulkDiscountForm] = useState({
        discount_type: 'percentage',
        discount_value: 10,
        discount_active: true
    });
    const [discountFilter, setDiscountFilter] = useState('all');
    
    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Get token from localStorage
    const getToken = () => {
        return localStorage.getItem('admin_token');
    };
    
    // Configure axios headers
    const getHeaders = () => {
        const token = getToken();
        return {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        };
    };
    
    const getMultipartHeaders = () => {
        const token = getToken();
        return {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data'
        };
    };
    
    // Check authentication on mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            checkAuth();
        }
    }, []);
    
    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/user/`, {
                headers: getHeaders()
            });
            if (response.data && response.data.is_staff) {
                setIsAuthenticated(true);
                setUser(response.data);
                fetchDashboardData();
            } else {
                logout();
            }
        } catch (error) {
            logout();
        }
    };
    
    const fetchDashboardData = async () => {
        try {
            // Fetch dashboard stats
            const statsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/`, {
                headers: getHeaders()
            });
            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats);
            }
            
            // Fetch discount stats
            const discountResponse = await axios.get(
                `${API_BASE_URL}/admin-products/discount_stats/`,
                { headers: getHeaders() }
            );
            if (discountResponse.data.success) {
                setDiscountStats(discountResponse.data.stats);
            }
            
            // Fetch products and categories
            await fetchProducts();
            await fetchCategories();
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };
    
    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/admin-products/`;
            
            const params = [];
            if (searchTerm) {
                params.push(`search=${encodeURIComponent(searchTerm)}`);
            }
            if (discountFilter !== 'all') {
                params.push(`discount_filter=${discountFilter}`);
            }
            
            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }
            
            const response = await axios.get(url, {
                headers: getHeaders()
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('পণ্য লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin-categories/`, {
                headers: getHeaders()
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/login/`, loginData);
            
            if (response.data.success) {
                localStorage.setItem('admin_token', response.data.token);
                setIsAuthenticated(true);
                setUser({
                    username: response.data.username,
                    email: response.data.email
                });
                await fetchDashboardData();
                setSuccess('লগইন সফল হয়েছে');
            } else {
                setError(response.data.error || 'লগইন ব্যর্থ হয়েছে');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'লগইন করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };
    
    const logout = () => {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setUser(null);
        setSuccess('লগআউট সফল হয়েছে');
    };
    
    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/admin/logout/`, {}, {
                headers: getHeaders()
            });
        } catch (error) {
            // Ignore logout errors
        } finally {
            logout();
        }
    };
    
    // Product CRUD operations with discount
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('category_id', productForm.category_id);
            formData.append('price', productForm.price);
            formData.append('quantity_unit', productForm.quantity_unit);
            formData.append('description', productForm.description);
            formData.append('stock', productForm.stock);
            formData.append('available', productForm.available);
            formData.append('featured', productForm.featured);
            
            // Discount fields
            formData.append('discount_type', productForm.discount_type);
            formData.append('discount_value', productForm.discount_value);
            formData.append('discount_active', productForm.discount_active);
            
            if (productForm.discount_start_date) {
                formData.append('discount_start_date', productForm.discount_start_date);
            }
            if (productForm.discount_end_date) {
                formData.append('discount_end_date', productForm.discount_end_date);
            }
            
            if (productForm.image) {
                formData.append('image', productForm.image);
            }
            
            if (editingProduct) {
                // Update product
                const response = await axios.put(
                    `${API_BASE_URL}/admin-products/${editingProduct.id}/`,
                    formData,
                    { headers: getMultipartHeaders() }
                );
                if (response.data.success) {
                    setSuccess('পণ্য আপডেট করা হয়েছে');
                    await fetchProducts();
                    resetProductForm();
                    setShowProductModal(false);
                }
            } else {
                // Create new product
                const response = await axios.post(
                    `${API_BASE_URL}/admin-products/`,
                    formData,
                    { headers: getMultipartHeaders() }
                );
                if (response.data.success) {
                    setSuccess('নতুন পণ্য যোগ করা হয়েছে');
                    await fetchProducts();
                    resetProductForm();
                    setShowProductModal(false);
                }
            }
        } catch (error) {
            setError(error.response?.data?.errors || 'পণ্য সেভ করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            slug: product.slug,
            category_id: product.category?.id || '',
            price: product.price,
            quantity_unit: product.quantity_unit || '1 kg',
            description: product.description || '',
            stock: product.stock,
            available: product.available,
            featured: product.featured,
            image: null,
            // Discount fields
            discount_type: product.discount_type || 'none',
            discount_value: product.discount_value || 0,
            discount_active: product.discount_active !== false,
            discount_start_date: product.discount_start_date || '',
            discount_end_date: product.discount_end_date || ''
        });
        setProductImagePreview(product.image_url || '');
        setShowProductModal(true);
    };
    
    const handleDeleteProduct = async (productId) => {
        if (window.confirm('আপনি কি এই পণ্য ডিলিট করতে চান?')) {
            try {
                await axios.delete(`${API_BASE_URL}/admin-products/${productId}/`, {
                    headers: getHeaders()
                });
                setSuccess('পণ্য ডিলিট করা হয়েছে');
                await fetchProducts();
            } catch (error) {
                setError('পণ্য ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };
    
    const resetProductForm = () => {
        setEditingProduct(null);
        setProductForm({
            name: '',
            slug: '',
            category_id: '',
            price: '',
            quantity_unit: '1 kg',
            description: '',
            stock: 10,
            available: true,
            featured: false,
            image: null,
            discount_type: 'none',
            discount_value: 0,
            discount_active: true,
            discount_start_date: '',
            discount_end_date: ''
        });
        setProductImagePreview('');
    };
    
    // Discount management functions
    const handleToggleDiscount = async (productId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin-products/${productId}/toggle_discount/`,
                {},
                { headers: getHeaders() }
            );
            if (response.data.success) {
                setSuccess(response.data.message);
                await fetchProducts();
                await fetchDashboardData();
            }
        } catch (error) {
            setError('ডিসকাউন্ট টগল করতে সমস্যা হয়েছে');
        }
    };
    
    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };
    
    const handleSelectAll = () => {
        if (selectedProducts.length === currentProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(currentProducts.map(p => p.id));
        }
    };
    
    const handleBulkDiscountApply = async () => {
        if (selectedProducts.length === 0) {
            setError('কোনো পণ্য সিলেক্ট করা হয়নি');
            return;
        }
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}/admin-products/bulk_discount_update/`,
                {
                    product_ids: selectedProducts,
                    ...bulkDiscountForm
                },
                { headers: getHeaders() }
            );
            
            if (response.data.success) {
                setSuccess(response.data.message);
                setSelectedProducts([]);
                setShowBulkDiscountModal(false);
                setBulkDiscountForm({
                    discount_type: 'percentage',
                    discount_value: 10,
                    discount_active: true
                });
                await fetchProducts();
                await fetchDashboardData();
            }
        } catch (error) {
            setError(error.response?.data?.error || 'বাল্ক ডিসকাউন্ট প্রয়োগ করতে সমস্যা হয়েছে');
        }
    };
    
    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductForm({...productForm, image: file});
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Handle search and filter
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProducts();
    };
    
    const handleDiscountFilterChange = (filter) => {
        setDiscountFilter(filter);
        setCurrentPage(1);
    };
    
    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    // Calculate discount display
    const calculateDiscountDisplay = (product) => {
        if (!product.has_discount || !product.discount_active) {
            return null;
        }
        
        if (product.discount_type === 'percentage') {
            return `${product.discount_value}%`;
        } else if (product.discount_type === 'fixed') {
            return `৳${product.discount_value}`;
        }
        return null;
    };
    
    const calculateSavings = (product) => {
        if (!product.has_discount || !product.discount_active || !product.discount_price) {
            return 0;
        }
        return product.price - product.discount_price;
    };
    
    // Render login form
    if (!isAuthenticated) {
        return (
            <Container className="mt-5" style={{ maxWidth: '400px' }}>
                <Card className="shadow">
                    <Card.Header className="bg-primary text-white">
                        <h4 className="mb-0">Admin Login</h4>
                    </Card.Header>
                    <Card.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={loginData.username}
                                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-100"
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        );
    }
    
    // Render admin dashboard
    return (
        <Container fluid className="mt-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="mb-0">Admin Dashboard</h3>
                                <p className="text-muted mb-0">
                                    Welcome, {user?.username} | {user?.email}
                                </p>
                            </div>
                            <div>
                                <Button 
                                    variant="outline-primary" 
                                    className="me-2"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    <FaLock className="me-2" />
                                    Change Password
                                </Button>
                                <Button 
                                    variant="danger"
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt className="me-2" />
                                    Logout
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={2}>
                    <Card className="shadow border-primary">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Total Products</h6>
                                    <h3 className="mb-0">{stats.total_products}</h3>
                                </div>
                                <FaBox className="text-primary" size={30} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="shadow border-success">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Discounted</h6>
                                    <h3 className="mb-0">{stats.discounted_products}</h3>
                                </div>
                                <FaPercent className="text-success" size={30} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="shadow border-warning">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Avg Discount</h6>
                                    <h3 className="mb-0">{stats.discount_percentage}%</h3>
                                </div>
                                <FaTags className="text-warning" size={30} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="shadow border-info">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Active Discounts</h6>
                                    <h3 className="mb-0">{discountStats.active_discounts}</h3>
                                </div>
                                <FaFire className="text-info" size={30} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="shadow border-danger">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Featured</h6>
                                    <h3 className="mb-0">{stats.featured_products}</h3>
                                </div>
                                <FaEye className="text-danger" size={30} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="shadow border-secondary">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Categories</h6>
                                    <h3 className="mb-0">{stats.total_categories}</h3>
                                </div>
                                <FaTag className="text-secondary" size={30} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Discount Statistics */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow">
                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <FaPercent className="me-2 text-success" />
                                Discount Statistics
                            </h5>
                            <Badge bg="success">
                                Avg Discount: {discountStats.avg_discount}%
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h6>With Discount</h6>
                                        <ProgressBar now={discountStats.with_discount} 
                                                    max={discountStats.with_discount + discountStats.without_discount}
                                                    label={`${discountStats.with_discount}`}
                                                    variant="success" />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h6>Without Discount</h6>
                                        <ProgressBar now={discountStats.without_discount} 
                                                    max={discountStats.with_discount + discountStats.without_discount}
                                                    label={`${discountStats.without_discount}`}
                                                    variant="warning" />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h6>Active Discounts</h6>
                                        <Badge bg="success" className="fs-5 p-2">
                                            {discountStats.active_discounts}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h6>Expired Discounts</h6>
                                        <Badge bg="danger" className="fs-5 p-2">
                                            {discountStats.expired_discounts}
                                        </Badge>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Tabs */}
            <Row>
                <Col>
                    <Card className="shadow">
                        <Card.Header className="bg-light">
                            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                                <Nav.Item>
                                    <Nav.Link eventKey="products">Products</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="categories">Categories</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="discounts">
                                        <FaPercent className="me-1" />
                                        Discount Management
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                        
                        <Card.Body>
                            {/* Messages */}
                            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
                            
                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5>Product Management</h5>
                                        <div className="d-flex">
                                            <DropdownButton
                                                title={`Filter: ${discountFilter === 'all' ? 'All Products' : 
                                                       discountFilter === 'with_discount' ? 'With Discount' : 
                                                       discountFilter === 'without_discount' ? 'Without Discount' : 'Expired Discount'}`}
                                                className="me-3"
                                            >
                                                <Dropdown.Item onClick={() => handleDiscountFilterChange('all')}>
                                                    All Products
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDiscountFilterChange('with_discount')}>
                                                    With Discount
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDiscountFilterChange('without_discount')}>
                                                    Without Discount
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDiscountFilterChange('expired_discount')}>
                                                    Expired Discount
                                                </Dropdown.Item>
                                            </DropdownButton>
                                            
                                            <Form className="me-3" onSubmit={handleSearchSubmit}>
                                                <InputGroup>
                                                    <FormControl
                                                        placeholder="Search products..."
                                                        value={searchTerm}
                                                        onChange={handleSearch}
                                                    />
                                                    <Button type="submit" variant="outline-secondary">
                                                        <FaSearch />
                                                    </Button>
                                                </InputGroup>
                                            </Form>
                                            
                                            {selectedProducts.length > 0 && (
                                                <Button 
                                                    variant="warning"
                                                    className="me-2"
                                                    onClick={() => setShowBulkDiscountModal(true)}
                                                >
                                                    <FaPercent className="me-2" />
                                                    Bulk Discount ({selectedProducts.length})
                                                </Button>
                                            )}
                                            
                                            <Button 
                                                variant="primary"
                                                onClick={() => {
                                                    resetProductForm();
                                                    setShowProductModal(true);
                                                }}
                                            >
                                                <FaPlus className="me-2" />
                                                Add Product
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2">Loading products...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th width="5%">
                                                            <Form.Check
                                                                checked={selectedProducts.length === currentProducts.length}
                                                                onChange={handleSelectAll}
                                                            />
                                                        </th>
                                                        <th width="10%">ID</th>
                                                        <th width="15%">Image</th>
                                                        <th>Name</th>
                                                        <th width="10%">Price</th>
                                                        <th width="15%">Discount</th>
                                                        <th width="10%">Stock</th>
                                                        <th width="10%">Status</th>
                                                        <th width="15%">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentProducts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="9" className="text-center py-4">
                                                                No products found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        currentProducts.map(product => (
                                                            <tr key={product.id} 
                                                                className={product.has_discount ? 'table-success' : ''}>
                                                                <td>
                                                                    <Form.Check
                                                                        checked={selectedProducts.includes(product.id)}
                                                                        onChange={() => handleSelectProduct(product.id)}
                                                                    />
                                                                </td>
                                                                <td>{product.id}</td>
                                                                <td>
                                                                    <img 
                                                                        src={product.image_url || 'https://via.placeholder.com/50'} 
                                                                        alt={product.name}
                                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                        className="rounded"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <strong>{product.name}</strong>
                                                                        <div>
                                                                            <small className="text-muted">{product.quantity_unit}</small>
                                                                            {product.featured && (
                                                                                <Badge bg="warning" className="ms-2">Featured</Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {product.has_discount ? (
                                                                        <div>
                                                                            <div style={{ textDecoration: 'line-through', color: '#999' }}>
                                                                                ৳{product.price}
                                                                            </div>
                                                                            <strong className="text-danger">
                                                                                ৳{product.discount_price || product.price}
                                                                            </strong>
                                                                        </div>
                                                                    ) : (
                                                                        <strong>৳{product.price}</strong>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {product.has_discount ? (
                                                                        <div>
                                                                            <Badge bg="success">
                                                                                {product.discount_type === 'percentage' ? 
                                                                                 `${product.discount_value}%` : 
                                                                                 `৳${product.discount_value}`}
                                                                            </Badge>
                                                                            <div>
                                                                                <small className="text-success">
                                                                                    Save: ৳{calculateSavings(product)}
                                                                                </small>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant={product.discount_active ? "success" : "secondary"}
                                                                                onClick={() => handleToggleDiscount(product.id)}
                                                                                className="mt-1"
                                                                            >
                                                                                {product.discount_active ? 
                                                                                 <FaToggleOn /> : 
                                                                                 <FaToggleOff />}
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <Badge bg="secondary">No Discount</Badge>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <Badge bg={product.stock > 10 ? 'success' : 'warning'}>
                                                                        {product.stock}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    {product.available ? (
                                                                        <Badge bg="success">Available</Badge>
                                                                    ) : (
                                                                        <Badge bg="danger">Out of Stock</Badge>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <Button 
                                                                        variant="outline-primary" 
                                                                        size="sm" 
                                                                        className="me-1"
                                                                        onClick={() => handleEditProduct(product)}
                                                                    >
                                                                        <FaEdit />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        size="sm"
                                                                        onClick={() => handleDeleteProduct(product.id)}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                            
                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="d-flex justify-content-center mt-4">
                                                    <Pagination>
                                                        <Pagination.Prev 
                                                            disabled={currentPage === 1}
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                        />
                                                        {[...Array(totalPages)].map((_, index) => (
                                                            <Pagination.Item
                                                                key={index + 1}
                                                                active={index + 1 === currentPage}
                                                                onClick={() => handlePageChange(index + 1)}
                                                            >
                                                                {index + 1}
                                                            </Pagination.Item>
                                                        ))}
                                                        <Pagination.Next 
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                        />
                                                    </Pagination>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                            
                            {/* Categories Tab */}
                            {activeTab === 'categories' && (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5>Category Management</h5>
                                        <Button 
                                            variant="primary"
                                            onClick={() => {
                                                resetCategoryForm();
                                                setShowCategoryModal(true);
                                            }}
                                        >
                                            <FaPlus className="me-2" />
                                            Add Category
                                        </Button>
                                    </div>
                                    
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Slug</th>
                                                <th>Product Count</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4">
                                                        No categories found
                                                    </td>
                                                </tr>
                                            ) : (
                                                categories.map(category => (
                                                    <tr key={category.id}>
                                                        <td>{category.id}</td>
                                                        <td>
                                                            <strong>{category.name}</strong>
                                                        </td>
                                                        <td>
                                                            <code>{category.slug}</code>
                                                        </td>
                                                        <td>
                                                            <Badge bg="primary">
                                                                {category.product_count || 0}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm" 
                                                                className="me-1"
                                                                onClick={() => handleEditCategory(category)}
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm"
                                                                onClick={() => handleDeleteCategory(category.id)}
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                            
                            {/* Discount Management Tab */}
                            {activeTab === 'discounts' && (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5>
                                            <FaPercent className="me-2 text-success" />
                                            Discount Management
                                        </h5>
                                        <Button 
                                            variant="success"
                                            onClick={() => setShowBulkDiscountModal(true)}
                                            disabled={selectedProducts.length === 0}
                                        >
                                            <FaPercent className="me-2" />
                                            Apply Bulk Discount ({selectedProducts.length} selected)
                                        </Button>
                                    </div>
                                    
                                    <Card className="mb-4">
                                        <Card.Header>
                                            <h6>Quick Discount Actions</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={3}>
                                                    <Button 
                                                        variant="outline-success" 
                                                        className="w-100 mb-2"
                                                        onClick={async () => {
                                                            const productsWithoutDiscount = products.filter(
                                                                p => !p.has_discount || !p.discount_active
                                                            );
                                                            if (productsWithoutDiscount.length === 0) {
                                                                setError('All products already have discounts');
                                                                return;
                                                            }
                                                            
                                                            setBulkDiscountForm({
                                                                discount_type: 'percentage',
                                                                discount_value: 10,
                                                                discount_active: true
                                                            });
                                                            setSelectedProducts(productsWithoutDiscount.map(p => p.id));
                                                            setShowBulkDiscountModal(true);
                                                        }}
                                                    >
                                                        <FaPlus className="me-2" />
                                                        Add 10% Discount to All Without Discount
                                                    </Button>
                                                </Col>
                                                <Col md={3}>
                                                    <Button 
                                                        variant="outline-warning" 
                                                        className="w-100 mb-2"
                                                        onClick={async () => {
                                                            const productsWithDiscount = products.filter(
                                                                p => p.has_discount && p.discount_active
                                                            );
                                                            if (productsWithDiscount.length === 0) {
                                                                setError('No products with active discounts');
                                                                return;
                                                            }
                                                            
                                                            try {
                                                                for (const product of productsWithDiscount) {
                                                                    await handleToggleDiscount(product.id);
                                                                }
                                                                setSuccess('All discounts toggled');
                                                                await fetchProducts();
                                                            } catch (error) {
                                                                setError('Error toggling discounts');
                                                            }
                                                        }}
                                                    >
                                                        <FaToggleOn className="me-2" />
                                                        Toggle All Discounts
                                                    </Button>
                                                </Col>
                                                <Col md={3}>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        className="w-100 mb-2"
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to remove all discounts?')) {
                                                                try {
                                                                    const productsWithDiscount = products.filter(
                                                                        p => p.has_discount && p.discount_active
                                                                    );
                                                                    
                                                                    for (const product of productsWithDiscount) {
                                                                        await axios.put(
                                                                            `${API_BASE_URL}/admin-products/${product.id}/`,
                                                                            {
                                                                                ...product,
                                                                                discount_type: 'none',
                                                                                discount_active: false,
                                                                                discount_value: 0
                                                                            },
                                                                            { headers: getHeaders() }
                                                                        );
                                                                    }
                                                                    
                                                                    setSuccess('All discounts removed');
                                                                    await fetchProducts();
                                                                } catch (error) {
                                                                    setError('Error removing discounts');
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <FaTrash className="me-2" />
                                                        Remove All Discounts
                                                    </Button>
                                                </Col>
                                                <Col md={3}>
                                                    <Button 
                                                        variant="outline-info" 
                                                        className="w-100 mb-2"
                                                        onClick={() => {
                                                            const featuredProducts = products.filter(p => p.featured);
                                                            if (featuredProducts.length === 0) {
                                                                setError('No featured products');
                                                                return;
                                                            }
                                                            
                                                            setSelectedProducts(featuredProducts.map(p => p.id));
                                                            setSuccess(`${featuredProducts.length} featured products selected for discount`);
                                                        }}
                                                    >
                                                        <FaTags className="me-2" />
                                                        Select Featured Products
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                    
                                    <Card>
                                        <Card.Header>
                                            <h6>Top Discounted Products</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            {products.filter(p => p.has_discount && p.discount_active).length === 0 ? (
                                                <Alert variant="info">
                                                    No discounted products found
                                                </Alert>
                                            ) : (
                                                <Table striped bordered hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Original Price</th>
                                                            <th>Discounted Price</th>
                                                            <th>Discount</th>
                                                            <th>Savings</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {products
                                                            .filter(p => p.has_discount && p.discount_active)
                                                            .sort((a, b) => {
                                                                const discountA = a.discount_type === 'percentage' ? 
                                                                    a.discount_value : 
                                                                    (a.discount_value / a.price) * 100;
                                                                const discountB = b.discount_type === 'percentage' ? 
                                                                    b.discount_value : 
                                                                    (b.discount_value / b.price) * 100;
                                                                return discountB - discountA;
                                                            })
                                                            .slice(0, 10)
                                                            .map(product => (
                                                                <tr key={product.id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <img 
                                                                                src={product.image_url || 'https://via.placeholder.com/40'} 
                                                                                alt={product.name}
                                                                                style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                                                                className="rounded"
                                                                            />
                                                                            <div>
                                                                                <strong>{product.name}</strong>
                                                                                <div>
                                                                                    <small className="text-muted">{product.quantity_unit}</small>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                                                            ৳{product.price}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <strong className="text-danger">
                                                                            ৳{product.discount_price || product.price}
                                                                        </strong>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg="success" className="fs-6">
                                                                            {product.discount_type === 'percentage' ? 
                                                                             `${product.discount_value}%` : 
                                                                             `৳${product.discount_value}`}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg="warning" className="fs-6">
                                                                            ৳{calculateSavings(product)}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={product.discount_active ? "success" : "secondary"}
                                                                            onClick={() => handleToggleDiscount(product.id)}
                                                                        >
                                                                            {product.discount_active ? 
                                                                             <FaToggleOn /> : 
                                                                             <FaToggleOff />}
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </Table>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Product Modal */}
            <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProductSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category *</Form.Label>
                                            <Form.Select
                                                value={productForm.category_id}
                                                onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Price *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                value={productForm.price}
                                                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity Unit *</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={productForm.quantity_unit}
                                            onChange={(e) => setProductForm({...productForm, quantity_unit: e.target.value})}
                                            required
                                            placeholder="e.g., 1 kg, 500 গ্রাম"
                                        />
                                        <DropdownButton
                                            variant="outline-secondary"
                                            title="Examples"
                                        >
                                            {['1 kg', '500 গ্রাম', '250 গ্রাম', '1 লিটার', '500 মিলি', '1 পিস'].map(example => (
                                                <Dropdown.Item 
                                                    key={example}
                                                    onClick={() => setProductForm({...productForm, quantity_unit: example})}
                                                >
                                                    {example}
                                                </Dropdown.Item>
                                            ))}
                                        </DropdownButton>
                                    </InputGroup>
                                </Form.Group>
                                
                                {/* Discount Settings */}
                                <Card className="mb-3">
                                    <Card.Header>
                                        <h6 className="mb-0">
                                            <FaPercent className="me-2 text-success" />
                                            Discount Settings
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Discount Type</Form.Label>
                                                    <Form.Select
                                                        value={productForm.discount_type}
                                                        onChange={(e) => setProductForm({...productForm, discount_type: e.target.value})}
                                                    >
                                                        <option value="none">No Discount</option>
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Discount Value</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        value={productForm.discount_value}
                                                        onChange={(e) => setProductForm({...productForm, discount_value: e.target.value})}
                                                        disabled={productForm.discount_type === 'none'}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        {productForm.discount_type === 'percentage' ? 
                                                         'Percentage discount (0-100)' : 
                                                         'Fixed amount discount'}
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        
                                        {productForm.discount_type !== 'none' && (
                                            <>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Start Date (Optional)</Form.Label>
                                                            <Form.Control
                                                                type="datetime-local"
                                                                value={productForm.discount_start_date}
                                                                onChange={(e) => setProductForm({...productForm, discount_start_date: e.target.value})}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>End Date (Optional)</Form.Label>
                                                            <Form.Control
                                                                type="datetime-local"
                                                                value={productForm.discount_end_date}
                                                                onChange={(e) => setProductForm({...productForm, discount_end_date: e.target.value})}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                
                                                <Form.Group className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Discount Active"
                                                        checked={productForm.discount_active}
                                                        onChange={(e) => setProductForm({...productForm, discount_active: e.target.checked})}
                                                    />
                                                </Form.Group>
                                                
                                                {/* Discount Preview */}
                                                {productForm.price && productForm.discount_type !== 'none' && (
                                                    <Alert variant="info">
                                                        <strong>Discount Preview:</strong>
                                                        <div>
                                                            Original Price: ৳{productForm.price}
                                                        </div>
                                                        <div>
                                                            Discount: {productForm.discount_type === 'percentage' ? 
                                                                      `${productForm.discount_value}%` : 
                                                                      `৳${productForm.discount_value}`}
                                                        </div>
                                                        {productForm.discount_type === 'percentage' && productForm.discount_value > 0 && (
                                                            <div>
                                                                Discounted Price: ৳{
                                                                    (productForm.price - (productForm.price * productForm.discount_value / 100)).toFixed(2)
                                                                }
                                                            </div>
                                                        )}
                                                        {productForm.discount_type === 'fixed' && productForm.discount_value > 0 && (
                                                            <div>
                                                                Discounted Price: ৳{
                                                                    Math.max(0, productForm.price - productForm.discount_value).toFixed(2)
                                                                }
                                                            </div>
                                                        )}
                                                    </Alert>
                                                )}
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Stock Quantity *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={productForm.stock}
                                                onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Status</Form.Label>
                                            <div>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Available"
                                                    checked={productForm.available}
                                                    onChange={(e) => setProductForm({...productForm, available: e.target.checked})}
                                                    className="d-inline-block me-3"
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Featured"
                                                    checked={productForm.featured}
                                                    onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                                                    className="d-inline-block"
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Image</Form.Label>
                                    <div className="border rounded p-3 text-center mb-3">
                                        {productImagePreview ? (
                                            <img 
                                                src={productImagePreview} 
                                                alt="Preview" 
                                                className="img-fluid mb-2"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        ) : (
                                            <div className="py-5">
                                                <FaImage size={50} className="text-muted" />
                                                <p className="mt-2 text-muted">No image selected</p>
                                            </div>
                                        )}
                                    </div>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <Form.Text className="text-muted">
                                        Recommended size: 500x500 pixels
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowProductModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Save Product'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            
            {/* Bulk Discount Modal */}
            <Modal show={showBulkDiscountModal} onHide={() => setShowBulkDiscountModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Apply Bulk Discount</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        Applying discount to {selectedProducts.length} selected products
                    </Alert>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Discount Type</Form.Label>
                        <Form.Select
                            value={bulkDiscountForm.discount_type}
                            onChange={(e) => setBulkDiscountForm({...bulkDiscountForm, discount_type: e.target.value})}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount</option>
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Discount Value
                            {bulkDiscountForm.discount_type === 'percentage' ? ' (%)' : ' (৳)'}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            value={bulkDiscountForm.discount_value}
                            onChange={(e) => setBulkDiscountForm({...bulkDiscountForm, discount_value: e.target.value})}
                            required
                        />
                        {bulkDiscountForm.discount_type === 'percentage' && (
                            <Form.Text className="text-muted">
                                Enter percentage value (0-100)
                            </Form.Text>
                        )}
                        {bulkDiscountForm.discount_type === 'fixed' && (
                            <Form.Text className="text-muted">
                                Enter fixed amount discount
                            </Form.Text>
                        )}
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Discount Active"
                            checked={bulkDiscountForm.discount_active}
                            onChange={(e) => setBulkDiscountForm({...bulkDiscountForm, discount_active: e.target.checked})}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBulkDiscountModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleBulkDiscountApply} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Apply Discount'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Category Modal */}
            <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCategorySubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Slug *</Form.Label>
                            <Form.Control
                                type="text"
                                value={categoryForm.slug}
                                onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                                required
                                placeholder="e.g., electronics, clothing"
                            />
                            <Form.Text className="text-muted">
                                URL-friendly version of the name (lowercase, hyphens)
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Save Category'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            
            {/* Change Password Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleChangePassword}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Old Password *</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordForm.old_password}
                                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>New Password *</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                required
                            />
                            <Form.Text className="text-muted">
                                Minimum 8 characters
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password *</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : 'Change Password'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminPanel;