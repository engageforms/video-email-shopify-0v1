# Deployment Guide

This guide will help you deploy the Video Personalization Shopify App to production using Render.

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Backblaze B2 Account**: For video storage
4. **Email Service**: SMTP credentials (Gmail, SendGrid, etc.)
5. **Shopify Partner Account**: For app credentials

## Step 1: Prepare Your Code

### 1.1 Frontend (Remix App)
```bash
cd video-email-app-0v1
# Your code is already ready
```

### 1.2 Backend (Rails API)
```bash
cd video-email-backend
# Your code is already ready
```

## Step 2: Deploy to Render

### 2.1 Deploy Frontend (Remix)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `video-email-app-0v1` directory
5. Configure:
   - **Name**: `video-personalization-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Starter` (free tier)

### 2.2 Deploy Backend (Rails API)

1. Create another web service
2. Select the `video-email-backend` directory
3. Configure:
   - **Name**: `video-personalization-backend`
   - **Environment**: `Ruby`
   - **Build Command**: `bundle install && rails db:migrate`
   - **Start Command**: `rails server -p $PORT`
   - **Plan**: `Starter`

### 2.3 Deploy Sidekiq Worker

1. Create a background worker
2. Select the `video-email-backend` directory
3. Configure:
   - **Name**: `video-personalization-worker`
   - **Environment**: `Ruby`
   - **Build Command**: `bundle install`
   - **Start Command**: `bundle exec sidekiq`
   - **Plan**: `Starter`

### 2.4 Create Database

1. Go to "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `video-personalization-db`
   - **Plan**: `Starter` (free tier)
3. Note the connection string

### 2.5 Create Redis

1. Go to "New +" → "Redis"
2. Configure:
   - **Name**: `video-personalization-redis`
   - **Plan**: `Starter` (free tier)
3. Note the connection string

## Step 3: Configure Environment Variables

### 3.1 Frontend Environment Variables

In your frontend service settings, add:

```env
NODE_ENV=production
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=write_products,read_orders,write_metaobjects,read_metaobjects,write_customers,read_customers
HOST=https://your-frontend-url.onrender.com
```

### 3.2 Backend Environment Variables

In your backend service settings, add:

```env
RAILS_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
B2_ACCOUNT_ID=your_b2_account_id
B2_ACCOUNT_TOKEN=your_b2_account_token
B2_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=your_b2_bucket_name
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### 3.3 Worker Environment Variables

Use the same environment variables as the backend service.

## Step 4: Update Shopify App Configuration

1. Go to your Shopify Partner Dashboard
2. Select your app
3. Update the app URL to your frontend URL
4. Update webhook URLs to point to your backend
5. Update redirect URLs

## Step 5: Test the Deployment

### 5.1 Test Frontend
1. Visit your frontend URL
2. Install the app in a test store
3. Verify the admin interface loads

### 5.2 Test Backend
1. Check the backend logs for any errors
2. Test the API endpoints
3. Verify database connections

### 5.3 Test Video Generation
1. Create a test order in your store
2. Check the video management section
3. Verify webhook processing

## Step 6: Production Optimizations

### 6.1 Performance
- Upgrade to paid plans for better performance
- Configure CDN for video delivery
- Optimize video compression settings

### 6.2 Monitoring
- Set up error monitoring (Sentry, etc.)
- Configure logging aggregation
- Set up health checks

### 6.3 Security
- Use environment variables for all secrets
- Configure CORS properly
- Set up rate limiting

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs for missing dependencies
   - Verify environment variables
   - Check file permissions

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is accessible

3. **Redis Connection Issues**
   - Verify REDIS_URL format
   - Check Redis service status
   - Ensure Redis is accessible

4. **Video Generation Failures**
   - Check FFmpeg installation
   - Verify Backblaze B2 credentials
   - Check Sidekiq worker logs

### Debug Commands

```bash
# Check backend logs
render logs video-personalization-backend

# Check worker logs
render logs video-personalization-worker

# Check database connection
render exec video-personalization-backend rails console
```

## Maintenance

### Regular Tasks
1. Monitor application logs
2. Check video generation success rates
3. Monitor storage usage on Backblaze B2
4. Update dependencies regularly
5. Backup database regularly

### Scaling
- Upgrade to higher plans as needed
- Consider horizontal scaling for high volume
- Implement caching strategies
- Optimize video processing pipeline

## Support

For issues with:
- **Render**: Check [Render Documentation](https://render.com/docs)
- **Shopify**: Check [Shopify App Development](https://shopify.dev/docs/apps)
- **Backblaze B2**: Check [Backblaze B2 Documentation](https://www.backblaze.com/b2/docs/)

## Cost Estimation

### Free Tier (Development)
- Frontend: Free
- Backend: Free
- Worker: Free
- Database: Free
- Redis: Free

### Production (Recommended)
- Frontend: $7/month
- Backend: $7/month
- Worker: $7/month
- Database: $7/month
- Redis: $7/month
- **Total**: ~$35/month

### High Volume
- Consider dedicated plans
- CDN for video delivery
- Multiple worker instances
- **Total**: $100-500/month depending on usage

