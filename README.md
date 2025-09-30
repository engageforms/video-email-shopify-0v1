# Video Personalization Shopify App

A comprehensive Shopify app that automatically generates personalized videos for customers based on their purchase data and sends them via email.

## Features

- **Automatic Video Generation**: Triggers on checkout/order events
- **Personalized Videos**: Uses customer name and product information
- **Email Integration**: Sends personalized videos via email with custom templates
- **Admin Interface**: Manage videos, templates, and settings
- **Background Processing**: Uses Sidekiq for video generation
- **Cloud Storage**: Stores videos on Backblaze B2
- **Meta Objects**: Stores customer data in Shopify meta objects

## Architecture

### Frontend (Remix + Shopify CLI)
- **Framework**: Remix with TypeScript
- **UI**: Shopify Polaris components
- **Authentication**: Shopify OAuth
- **Database**: SQLite (development) / PostgreSQL (production)

### Backend (Ruby on Rails)
- **Framework**: Ruby on Rails API
- **Video Processing**: FFmpeg with streamio-ffmpeg gem
- **Background Jobs**: Sidekiq
- **Storage**: Backblaze B2
- **Database**: PostgreSQL

## Setup Instructions

### 1. Frontend Setup (Remix App)

```bash
cd video-email-app-0v1
npm install
```

### 2. Backend Setup (Rails API)

```bash
cd ../video-email-backend
bundle install
rails db:migrate
```

### 3. Environment Variables

#### Frontend (.env)
```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_orders,write_metaobjects,read_metaobjects,write_customers,read_customers
HOST=https://your-domain.com
```

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost/video_email_backend_development

# Backblaze B2
B2_ACCOUNT_ID=your_account_id
B2_ACCOUNT_TOKEN=your_account_token
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=your_bucket_name

# Redis (for Sidekiq)
REDIS_URL=redis://localhost:6379

# Email Service (configure as needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 4. Required Services

#### FFmpeg Installation
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

#### Redis Installation
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

### 5. Backblaze B2 Setup

1. Create a Backblaze B2 account
2. Create a new bucket
3. Generate API keys
4. Update environment variables

### 6. Running the Application

#### Development Mode

**Frontend:**
```bash
cd video-email-app-0v1
npm run dev
```

**Backend:**
```bash
cd video-email-backend
rails server
```

**Sidekiq (in separate terminal):**
```bash
cd video-email-backend
bundle exec sidekiq
```

## Deployment

### Render Deployment

#### Frontend (Remix)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Configure environment variables

#### Backend (Rails)
1. Connect your GitHub repository
2. Set build command: `bundle install && rails db:migrate`
3. Set start command: `rails server`
4. Configure environment variables
5. Add Redis addon
6. Add PostgreSQL addon

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- Database URLs
- Backblaze B2 credentials
- Redis URL
- Email service credentials
- Shopify app credentials

## Usage

### 1. Install the App
- Install the app in your Shopify store
- Grant required permissions

### 2. Configure Email Templates
- Go to "Email Templates" in the admin
- Create custom email templates
- Use placeholders: `{{customer_first_name}}`, `{{video_link}}`, etc.

### 3. Test the Flow
- Create a test order in your store
- Check the "Video Management" section
- Verify video generation and email sending

### 4. Monitor Performance
- Use the dashboard to monitor video generation
- Check the "Video Management" section for status updates

## API Endpoints

### Rails Backend API

- `GET /api/v1/customer_video_data` - List all video data
- `POST /api/v1/customer_video_data` - Create new video data
- `GET /api/v1/email_templates` - List email templates
- `POST /api/v1/email_templates` - Create email template

## Webhooks

The app listens for the following Shopify webhooks:
- `orders/create` - Triggers video generation
- `orders/updated` - Updates video status
- `checkouts/create` - Creates video data
- `checkouts/update` - Updates video data

## Troubleshooting

### Common Issues

1. **Video Generation Fails**
   - Check FFmpeg installation
   - Verify Backblaze B2 credentials
   - Check Sidekiq logs

2. **Email Not Sending**
   - Verify email service configuration
   - Check SMTP credentials
   - Review email template syntax

3. **Webhooks Not Triggering**
   - Verify webhook URLs are accessible
   - Check Shopify app permissions
   - Review webhook configuration

### Logs

- **Frontend**: Check browser console and network tab
- **Backend**: Check Rails logs (`rails server` output)
- **Sidekiq**: Check Sidekiq logs for background job issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.