# Hostinger Integration Guide

This guide explains how to set up your Velora Tradings application on Hostinger with MySQL database and PHP backend.

## Prerequisites

- Hostinger Shared Hosting Account
- PHP 7.4+ with cURL and mysqli extensions enabled
- MySQL Database (provided by Hostinger)

## Database Credentials

Your database credentials from Hostinger:
- **Host**: 127.0.0.1
- **Database**: u443589701_velora_trading
- **User**: u443589701_velora_trading
- **Password**: Veloratrade@123
- **File System Path**: /home/u443589701/domains/veloratradings.com/

## Setup Instructions

### Step 1: Upload PHP Backend Files

1. Connect to your Hostinger account via FTP or File Manager
2. Navigate to your public_html directory: `/home/u443589701/domains/veloratradings.com/`
3. Create a new folder called `api`
4. Upload all files from `hostinger-api/` folder to `public_html/api/`

Directory structure should look like:
```
public_html/
├── api/
│   ├── config/
│   │   ├── database.php
│   │   ├── cors.php
│   │   ├── jwt.php
│   │   └── utils.php
│   ├── auth/
│   │   ├── signup.php
│   │   ├── signin.php
│   │   ├── get-user.php
│   │   └── update-profile.php
│   ├── products/
│   │   ├── list.php
│   │   ├── get.php
│   │   └── categories.php
│   ├── cart/
│   │   ├── get.php
│   │   ├── add.php
│   │   ├── update.php
│   │   ├── remove.php
│   │   └── clear.php
│   ├── wishlist/
│   │   ├── get.php
│   │   ├── add.php
│   │   └── remove.php
│   ├── addresses/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── orders/
│   │   ├── create.php
│   │   ├── get.php
│   │   └── list.php
│   ├── payment/
│   │   ├── create-razorpay-order.php
│   │   └── verify-razorpay-payment.php
│   ├── settings/
│   │   └── get.php
│   ├── storage/
│   │   ├── logs/
│   │   └── rate_limit/
│   └── database/
│       └── schema.sql
└── .htaccess
```

### Step 2: Create MySQL Database

1. Log into your Hostinger control panel
2. Go to "Databases" section
3. Create new database if not already created:
   - Database name: `u443589701_velora_trading`
   - Create a database user with the above credentials
4. Open phpMyAdmin
5. Select your database
6. Go to "Import" tab
7. Upload and import `hostinger-api/database/schema.sql` file

This will create all required tables and insert default data.

### Step 3: Update Configuration

1. Edit `hostinger-api/config/database.php` and verify credentials:
   - DB_HOST: 127.0.0.1
   - DB_NAME: u443589701_velora_trading
   - DB_USER: u443589701_velora_trading
   - DB_PASS: Veloratrade@123

2. Update JWT_SECRET in `database.php` (change in production):
   ```php
   define('JWT_SECRET', 'your_jwt_secret_key_change_this_in_production');
   ```

3. For Razorpay integration, configure in admin settings via API:
   - Set razorpay_key_id
   - Set razorpay_key_secret

### Step 4: Create Storage Directories

1. Create these directories via FTP:
   - `/api/storage/logs/` (755 permissions)
   - `/api/storage/rate_limit/` (755 permissions)
   - Make sure they're writable by PHP

### Step 5: Update Frontend Configuration

1. Update `.env` file in your React project:
   ```
   VITE_API_URL=https://veloratradings.com/api
   ```

2. The frontend is already configured to use the Hostinger client in `src/lib/hostinger-client.ts`

### Step 6: Test API Endpoints

Test your API with these curl commands:

#### Signup
```bash
curl -X POST https://veloratradings.com/api/auth/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone": "9876543210"
  }'
```

#### Get Products
```bash
curl https://veloratradings.com/api/products/list.php
```

### Step 7: Configure SMTP (for email notifications)

Update in `config/database.php`:
```php
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@veloratradings.com');
define('SMTP_PASS', 'your-email-password');
```

## Environment Variables

### Development (.env.local)
```
VITE_API_URL=http://localhost:8000/api
```

### Production (.env)
```
VITE_API_URL=https://veloratradings.com/api
```

## File Permissions

Set appropriate permissions for uploaded files:
```bash
chmod 755 api/
chmod 755 api/storage/
chmod 755 api/storage/logs/
chmod 755 api/storage/rate_limit/
chmod 644 api/**/*.php
chmod 644 .htaccess
```

## Security Considerations

1. **Change JWT Secret**: Update JWT_SECRET in production
2. **Database Backups**: Set up automatic backups in Hostinger control panel
3. **HTTPS**: Ensure your domain uses SSL/TLS certificate
4. **Rate Limiting**: Currently uses file-based storage; consider Redis for production
5. **Input Validation**: All inputs are sanitized and validated
6. **CORS**: Configure allowed origins in config/cors.php

## API Endpoints Reference

### Authentication
- POST `/auth/signup.php` - Register new user
- POST `/auth/signin.php` - Login user
- GET `/auth/get-user.php` - Get current user (requires auth)
- PUT `/auth/update-profile.php` - Update user profile (requires auth)

### Products
- GET `/products/list.php` - Get all products
- GET `/products/get.php?id={id}` - Get product details
- GET `/products/categories.php` - Get all categories

### Cart (requires auth)
- GET `/cart/get.php` - Get user's cart
- POST `/cart/add.php` - Add item to cart
- PUT `/cart/update.php` - Update cart item quantity
- DELETE `/cart/remove.php` - Remove item from cart
- DELETE `/cart/clear.php` - Clear entire cart

### Wishlist (requires auth)
- GET `/wishlist/get.php` - Get user's wishlist
- POST `/wishlist/add.php` - Add item to wishlist
- DELETE `/wishlist/remove.php` - Remove item from wishlist

### Addresses (requires auth)
- GET `/addresses/list.php` - Get user's addresses
- POST `/addresses/create.php` - Create new address
- PUT `/addresses/update.php` - Update address
- DELETE `/addresses/delete.php` - Delete address

### Orders (requires auth)
- GET `/orders/list.php` - Get user's orders
- GET `/orders/get.php?id={id}` - Get order details
- POST `/orders/create.php` - Create new order

### Payment (requires auth)
- POST `/payment/create-razorpay-order.php` - Create Razorpay order
- POST `/payment/verify-razorpay-payment.php` - Verify payment

### Settings
- GET `/settings/get.php` - Get site settings

## Troubleshooting

### 401 Unauthorized Errors
- Ensure token is properly sent in Authorization header
- Check token hasn't expired (24 hours validity)
- Verify JWT_SECRET matches between requests

### 404 Not Found Errors
- Check .htaccess file is properly deployed
- Verify mod_rewrite is enabled on server
- Check file paths are correct in Hostinger

### Database Connection Errors
- Verify database credentials are correct
- Check if MySQL service is running
- Ensure mysqli extension is enabled

### CORS Errors
- Check ALLOWED_ORIGINS in config/cors.php
- Ensure domain is listed in allowed origins
- Verify CORS headers are being sent

## Production Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up database backups
- [ ] Configure email/SMTP settings
- [ ] Add Razorpay API keys
- [ ] Set appropriate file permissions
- [ ] Set up monitoring and error logging
- [ ] Configure rate limiting for production
- [ ] Test all API endpoints thoroughly
- [ ] Set up CDN for static assets if needed

## Support

For Hostinger-specific issues, contact Hostinger support.
For application issues, check error logs in `/api/storage/logs/`
