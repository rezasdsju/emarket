# 🌿 Organic Solution: Backend API

RESTful backend for **Organic Solution**, an E-Commerce platform for organic products (dates, nuts, honey, dried fruits and more). Built with **Django**, **Django REST Framework** and **PostgreSQL**, it powers product browsing, search, order placement and payment tracking for the React frontend.

🔗 **Live Frontend:** https://organic-solution-pqrs.vercel.app/

---

## ✨ Features

- **Product catalog**: categories, product images, price, quantity unit (e.g. `1 kg`, `500 gm`), stock, availability and featured flags
- **Filtering, searching & ordering** on the product list endpoint
- **Advanced search**: multi-term, multi-field search with a custom relevance score, price range filters, category filter, sorting and pagination
- **Autocomplete suggestions** for products, categories and popular terms
- **Order placement**: creates the order and its items, calculates the total on the server and updates product stock automatically
- **Payment records**: supports bKash, Rocket, Nagad, Card and Cash on Delivery with auto-generated unique transaction IDs
- **Django Admin panel** for managing products, categories, orders and payments
- **PostgreSQL full-text search** field (`SearchVectorField`) prepared on the product model

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3 |
| Framework | Django, Django REST Framework |
| Database | PostgreSQL |
| Filtering | django-filter |
| Media | Pillow (`ImageField`) |
| Frontend | React (separate repository) |

---

## 📁 Project Structure

```
backend/
├── api/
│   ├── models.py        # Category, Product, Order, OrderItem, Payment
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # ViewSets + search/autocomplete/statistics views
│   └── urls.py          # Router and custom endpoints
├── manage.py
└── requirements.txt
```

---

## 🗄️ Data Models

| Model | Description |
|---|---|
| **Category** | `name`, `slug` |
| **Product** | `category`, `name`, `slug`, `image`, `price`, `quantity_unit`, `description`, `stock`, `available`, `featured`, `search_vector`, timestamps |
| **Order** | `user` (optional), `name`, `email`, `phone`, `address`, `total_price`, `paid`, `created` |
| **OrderItem** | `order`, `product`, `price` (price at purchase), `quantity` |
| **Payment** | `order`, `transaction_id`, `amount`, `payment_method`, `status`, `mobile_number`, timestamps |

**Payment methods:** `bkash`, `rocket`, `nagad`, `card`, `cod`
**Payment statuses:** `pending`, `processing`, `completed`, `failed`, `cancelled`

---

## 🚀 Getting Started

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 13+
- pip / virtualenv

### 2. Clone & install

```bash
git clone <your-backend-repo-url>
cd <your-backend-folder>

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

If you don't have a `requirements.txt` yet, the core dependencies are:

```bash
pip install django djangorestframework django-filter psycopg2-binary pillow django-cors-headers
```

### 3. Configure the database

Create a PostgreSQL database and update `settings.py` (or use environment variables):

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "organic_db",
        "USER": "your_db_user",
        "PASSWORD": "your_db_password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

Make sure these are in `INSTALLED_APPS`:

```python
"django.contrib.postgres",
"rest_framework",
"django_filters",
"corsheaders",
"api",
```

### 4. Migrate & run

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is now available at `http://127.0.0.1:8000/api/` and the admin panel at `http://127.0.0.1:8000/admin/`.

---

## 📡 API Reference

Base URL: `/api/`

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories/` | List all categories (with `product_count`) |
| POST | `/categories/` | Create a category |
| GET / PUT / PATCH / DELETE | `/categories/{slug}/` | Retrieve, update or delete by slug |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products/` | List available products |
| POST | `/products/` | Create a product (`multipart/form-data`) |
| GET / PUT / PATCH / DELETE | `/products/{id}/` | Retrieve, update or delete |
| GET | `/products/featured/` | Up to 8 latest featured products |
| GET | `/products/by_category/?category_slug=<slug>` | Products of a category |

**Query parameters for `/products/`**

| Parameter | Example | Description |
|---|---|---|
| `category` | `?category=2` | Filter by category ID |
| `featured` | `?featured=true` | Featured products only |
| `search` | `?search=honey` | Search in name, description, quantity unit |
| `ordering` | `?ordering=-price` | Order by `price`, `created`, `name` |

### Search

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search/?q=<term>` | Advanced relevance-based search |
| GET | `/search/autocomplete/?q=<term>` | Suggestions (min. 2 characters) |
| GET | `/search/statistics/` | Trending products, popular categories and searches |

**Parameters for `/search/`**

| Parameter | Description |
|---|---|
| `q` | Search query (required) |
| `category` | Category slug |
| `min_price`, `max_price` | Price range |
| `sort_by` | `relevance` (default), `price_asc`, `price_desc`, `newest` |
| `page` | Page number (20 results per page) |

**Example response**

```json
{
  "success": true,
  "query": "honey",
  "total_results": 6,
  "total_pages": 1,
  "current_page": 1,
  "sort_by": "relevance",
  "products": [ ... ],
  "filters": { "category": null, "min_price": null, "max_price": null }
}
```

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders/` | List orders |
| POST | `/orders/` | Place a new order |
| GET / PUT / PATCH / DELETE | `/orders/{id}/` | Manage an order |
| GET / POST | `/order-items/` | Order items |

**Place an order**

```http
POST /api/orders/
Content-Type: application/json
```

```json
{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "phone": "01700000000",
  "address": "House 12, Road 5, Dhaka",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 4, "quantity": 1 }
  ]
}
```

The server fetches each product's current price, creates the order items, computes `total_price` and deducts stock. A product is marked unavailable when its stock reaches zero.

### Payments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/payments/` | List payments |
| POST | `/payments/` | Create a payment for an order |
| GET / PUT / PATCH / DELETE | `/payments/{id}/` | Manage a payment |

**Create a payment**

```json
{
  "order_id": 12,
  "amount": "1250.00",
  "payment_method": "bkash",
  "mobile_number": "01700000000"
}
```

A unique `transaction_id` (format `TXNXXXXXXXX`) is generated automatically and the status starts as `pending`.

---

## 🔒 Production Checklist

Before deploying, please make sure to:

- [ ] Set `DEBUG = False` and configure `ALLOWED_HOSTS`
- [ ] Move `SECRET_KEY` and database credentials to environment variables
- [ ] Configure `CORS_ALLOWED_ORIGINS` for your frontend domain
- [ ] Set up media file storage (e.g. Cloudinary or S3) for product images
- [ ] Run `python manage.py collectstatic`
- [ ] Use a production server such as Gunicorn behind Nginx

---

## 🗺️ Roadmap

- [ ] Authentication & permissions (JWT) so only admins can write products, and users can only see their own orders
- [ ] Atomic order creation (`transaction.atomic` and row locking) to prevent overselling
- [ ] Server-side validation of stock before confirming an order
- [ ] Real payment gateway integration (bKash, Nagad, SSLCommerz)
- [ ] Use PostgreSQL `SearchVector` / trigram search in the search endpoint for better performance on large catalogs
- [ ] Replace `print` debugging with Python `logging`
- [ ] Order status tracking and email notifications
- [ ] Automated tests and CI

---

## 🤝 Contributing

Suggestions and pull requests are welcome. Please open an issue first to discuss major changes.

## 📄 License

This project is built for learning and portfolio purposes. Add a license of your choice (e.g. MIT) before distributing.

---

## 👤 Author

**Your Name**
GitHub: [@your-username](https://github.com/your-username)
Live Demo: https://organic-solution-pqrs.vercel.app/