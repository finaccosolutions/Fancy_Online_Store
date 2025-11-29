# Velora Tradings - Complete Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy Velora Tradings on Hostinger with a complete transition from Supabase to self-hosted MySQL database and PHP backend.

## What's Included

### Frontend
- React 18.3.1 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Fully functional e-commerce interface

### Backend (PHP)
- Authentication (signup, signin, profile management)
- Product & category management
- Shopping cart functionality
- Wishlist management
- Address management
- Order processing
- Razorpay payment integration
- Site settings management

### Database
- MySQL schema with all tables
- Relationships and constraints
- Indexes for performance
- Default data initialization

## Prerequisites

Before starting, ensure you have:
1. Hostinger shared hosting account with:
   - PHP 7.4+ with cURL and mysqli extensions
   - MySQL database access
   - FTP/File Manager access
   - Email account for SMTP (optional)

2. Your Hostinger details:
   - Host: 127.0.0.1
   - Database: u443589701_velora_trading
   - User: u443589701_velora_trading
   - Password: Veloratrade@123
   - File path: /home/u443589701/domains/veloratradings.com/

3. Domain configured to point to your Hostinger hosting

## Phase 1: Database Setup (15 minutes)

### Step 1.1: Access phpMyAdmin

1. Log into Hostinger control panel
2. Go to "Databases" → "phpMyAdmin"
3. Select your database: `u443589701_velora_trading`

### Step 1.2: Import Database Schema

1. In phpMyAdmin, go to "Import" tab
2. Click "Browse" and select `hostinger-api/database/schema.sql`
3. Click "Import"

This will create:
- users (user accounts)
- admin_users (admin assignments)
- products (product catalog)
- categories (product categories)
- cart_items (shopping carts)
- wishlist_items (wishlists)
- addresses (delivery/billing addresses)
- orders (customer orders)
- order_items (products in each order)
- order_tracking (order status history)
- site_settings (configuration storage)

### Step 1.3: Verify Tables

Run this query in phpMyAdmin SQL tab to verify:
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'u443589701_velora_trading';
```

Should return: **11**

## Phase 2: Deploy PHP Backend (20 minutes)

### Step 2.1: Upload Files via FTP

1. Download FTP client (FileZilla recommended)
2. Connect to Hostinger FTP:
   - Host: your-ftp-host
   - User: hostinger-ftp-user
   - Pass: hostinger-ftp-password

3. Navigate to: `/home/u443589701/domains/veloratradings.com/`

4. Create folder structure:
```
public_html/
├── api/
│   ├── config/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── wishlist/
│   ├── addresses/
│   ├── orders/
│   ├── payment/
│   ├── settings/
│   ├── storage/
│   │   ├── logs/ (create if missing)
│   │   └── rate_limit/ (create if missing)
│   ├── database/
│   └── index.php
```

### Step 2.2: Upload PHP Files

1. Upload all files from `hostinger-api/` to `/api/` folder
2. Set permissions (via FTP or Hostinger File Manager):
   - Directories: 755
   - Files: 644
   - `/api/storage/` and subdirectories: 755

### Step 2.3: Upload .htaccess

1. Upload `.htaccess` file from project root to `/public_html/`
2. Permissions: 644

### Step 2.4: Verify Installation

Test the API is running:
```bash
curl https://veloratradings.com/api/index.php
```

Should return JSON with API endpoints list.

## Phase 3: Update Configuration (10 minutes)

### Step 3.1: Update JWT Secret

In `/api/config/database.php`, change:
```php
define('JWT_SECRET', 'your_jwt_secret_key_change_this_in_production');
```

To a strong random value (use: https://www.random.org/strings/)

### Step 3.2: Configure Email (Optional)

If using email notifications, update in `/api/config/database.php`:
```php
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@veloratradings.com');
define('SMTP_PASS', 'your-email-password');
```

### Step 3.3: Configure CORS

Update `/api/config/cors.php` if needed:
```php
define('ALLOWED_ORIGINS', [
    'https://veloratradings.com',
    'https://www.veloratradings.com',
    'http://localhost:5173',
]);
```

## Phase 4: Deploy Frontend (15 minutes)

### Step 4.1: Update Environment

Update `.env` in project root:
```
VITE_API_URL=https://veloratradings.com/api
```

For local development:
```
VITE_API_URL=http://localhost:5173/api
```

### Step 4.2: Build React Project

```bash
npm install
npm run build
```

This creates optimized production build in `dist/` folder.

### Step 4.3: Upload Frontend Files

1. Upload entire `dist/` folder contents to `/public_html/`
2. Use FTP or Hostinger File Manager
3. Files should be at `/public_html/index.html`, `/public_html/assets/`, etc.

### Step 4.4: Test Frontend

1. Visit: https://veloratradings.com
2. Should load the home page
3. Try signup/signin to test API integration

## Phase 5: Configure Razorpay (Optional)

### Step 5.1: Get Razorpay Keys

1. Log into Razorpay Dashboard
2. Go to Settings → API Keys
3. Copy Key ID and Key Secret

### Step 5.2: Store Keys in Database

Use any HTTP client to call (with auth token):
```bash
curl -X POST https://veloratradings.com/api/settings/update.php \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_key_id": "YOUR_KEY_ID",
    "razorpay_key_secret": "YOUR_KEY_SECRET"
  }'
```

Or via phpMyAdmin, update site_settings table:
```sql
UPDATE site_settings SET value = '"YOUR_KEY_ID"' WHERE key = 'razorpay_key_id';
UPDATE site_settings SET value = '"YOUR_KEY_SECRET"' WHERE key = 'razorpay_key_secret';
```

## Phase 6: Testing (15 minutes)

### Test Signup
```bash
curl -X POST https://veloratradings.com/api/auth/signup.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "full_name": "Test User",
    "phone": "9876543210"
  }'
```

### Test Products
```bash
curl https://veloratradings.com/api/products/list.php
```

### Test Cart (with auth)
```bash
curl -X GET https://veloratradings.com/api/cart/get.php \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Phase 7: Production Checklist

- [ ] Database backup configured
- [ ] SSL/HTTPS enabled
- [ ] JWT_SECRET changed to strong value
- [ ] CORS origins configured correctly
- [ ] File permissions set (755 for dirs, 644 for files)
- [ ] Storage directories writable
- [ ] Email/SMTP configured (if needed)
- [ ] Razorpay keys configured
- [ ] All API endpoints tested
- [ ] Frontend loads and functions
- [ ] Login/signup works
- [ ] Cart operations work
- [ ] Order creation works
- [ ] Payment integration works
- [ ] Error logging configured
- [ ] Rate limiting active

## Troubleshooting

### 404 Errors on API Calls
- Check .htaccess is in public_html
- Verify mod_rewrite is enabled
- Check file paths match exactly

### 500 Internal Server Error
- Check error logs in `/api/storage/logs/`
- Verify database connection in `/api/config/database.php`
- Check PHP extensions (mysqli, cURL) are enabled

### Database Connection Failed
- Verify credentials in `database.php`
- Check database exists in phpMyAdmin
- Verify database user has proper permissions

### CORS Errors
- Check allowed origins in `cors.php`
- Verify domain matches exactly
- Test with curl first (no CORS issues)

### Frontend Not Loading
- Check dist folder uploaded completely
- Verify API_URL in .env is correct
- Check browser console for errors

### Payment Not Working
- Verify Razorpay keys in database
- Check payment endpoint logs
- Test Razorpay API directly

## File Structure After Deployment

```
https://veloratradings.com/
├── index.html
├── assets/
│   ├── index-*.css
│   ├── index-*.js
│   └── ...
├── api/
│   ├── config/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── wishlist/
│   ├── addresses/
│   ├── orders/
│   ├── payment/
│   ├── settings/
│   ├── storage/
│   │   ├── logs/
│   │   └── rate_limit/
│   ├── database/
│   └── index.php
└── .htaccess
```

## Monitoring and Maintenance

### View Error Logs
Logs stored in: `/api/storage/logs/YYYY-MM-DD.log`

Access via FTP or Hostinger File Manager.

### Database Backups
- Hostinger: Control Panel → Backups → Create Backup
- Set up automatic daily backups
- Download regularly for safe storage

### Check API Health
```bash
curl https://veloratradings.com/api/index.php
```

### Monitor Performance
- Check Hostinger analytics dashboard
- Review error logs weekly
- Monitor database size

## Support Resources

- Hostinger Help: https://support.hostinger.com/
- PHP Documentation: https://www.php.net/
- MySQL Documentation: https://dev.mysql.com/
- Razorpay Docs: https://razorpay.com/docs/

## Rollback Plan

If issues occur:

1. Keep Supabase credentials saved
2. Don't delete old API code
3. Update .env API_URL back to Supabase if needed
4. Revert frontend environment variables

## Next Steps

After successful deployment:

1. Set up automated backups
2. Configure CDN for assets (optional)
3. Set up SSL certificate renewal
4. Configure email notifications
5. Create admin account
6. Add initial product data
7. Test payment processing
8. Set up monitoring/alerting

## Contact

For deployment support:
- Check HOSTINGER_SETUP.md for detailed info
- Review API endpoint documentation
- Check error logs for specific issues
