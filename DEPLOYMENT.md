# Deployment Guide

This guide covers deployment of the QuickCommerce application to various platforms.

## Backend Deployment

### Option 1: Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
cd backend
heroku create quickcommerce-api
```

3. **Add MongoDB Add-on**
```bash
heroku addons:create mongolab:sandbox
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set JWT_REFRESH_SECRET=your_refresh_secret
heroku config:set AWS_ACCESS_KEY_ID=your_aws_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_aws_secret
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_S3_BUCKET=your_bucket
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASSWORD=your_password
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set TWILIO_PHONE_NUMBER=your_number
```

5. **Create Procfile**
```bash
echo "web: node src/server.js" > Procfile
```

6. **Deploy**
```bash
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

7. **Open App**
```bash
heroku open
```

### Option 2: AWS EC2

#### Prerequisites
- AWS account
- EC2 instance (Ubuntu 20.04 or later)
- SSH access to instance

#### Steps

1. **Connect to EC2 Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MongoDB**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Install PM2**
```bash
sudo npm install -g pm2
```

5. **Clone Repository**
```bash
git clone https://github.com/yourusername/quickcommerce.git
cd quickcommerce/backend
```

6. **Install Dependencies**
```bash
npm install --production
```

7. **Setup Environment**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

8. **Start Application with PM2**
```bash
pm2 start src/server.js --name quickcommerce-api
pm2 save
pm2 startup
```

9. **Setup Nginx as Reverse Proxy**
```bash
sudo apt-get install -y nginx

sudo nano /etc/nginx/sites-available/quickcommerce
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: DigitalOcean App Platform

1. **Create Account** on DigitalOcean
2. **Connect GitHub** repository
3. **Configure App**:
   - Runtime: Node.js
   - Build Command: `npm install`
   - Run Command: `npm start`
4. **Add Environment Variables** in App settings
5. **Add MongoDB Database** component
6. **Deploy**

### Option 4: Render

1. **Create Account** on Render
2. **New Web Service**
3. **Connect Repository**
4. **Configure**:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**
6. **Add MongoDB** (using MongoDB Atlas)
7. **Deploy**

## Mobile App Deployment

### iOS Deployment (App Store)

#### Prerequisites
- Apple Developer account ($99/year)
- macOS with Xcode
- Valid provisioning profiles and certificates

#### Steps

1. **Configure App**
```bash
cd mobile
```

Edit `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.quickcommerce",
      "buildNumber": "1.0.0"
    }
  }
}
```

2. **Build IPA**
```bash
expo build:ios
```

3. **Download IPA** when build completes

4. **Upload to App Store Connect**
- Use Transporter app or Xcode
- Submit for review

5. **App Store Submission**
- Fill in app metadata
- Add screenshots
- Submit for review

### Android Deployment (Google Play)

#### Prerequisites
- Google Play Developer account ($25 one-time)
- Android Studio (optional)

#### Steps

1. **Configure App**

Edit `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.quickcommerce",
      "versionCode": 1
    }
  }
}
```

2. **Build APK/AAB**
```bash
cd mobile
expo build:android
```

Select APK or AAB format when prompted.

3. **Download Build** when complete

4. **Create Google Play Listing**
- Go to Google Play Console
- Create new application
- Fill in store listing details
- Add screenshots and graphics

5. **Upload APK/AAB**
- Go to Release > Production
- Upload your build
- Complete release forms
- Submit for review

### Over-The-Air (OTA) Updates with Expo

```bash
cd mobile
expo publish
```

This publishes updates that users will receive without going through app stores (for JavaScript/asset changes only).

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account** at mongodb.com/cloud/atlas
2. **Create Cluster** (Free tier available)
3. **Create Database User**
4. **Whitelist IP** (or allow from anywhere)
5. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/quickcommerce?retryWrites=true&w=majority
```
6. **Update Environment Variable**
```bash
MONGODB_URI=your_connection_string
```

## AWS S3 Setup

1. **Create S3 Bucket**
```bash
aws s3 mb s3://quickcommerce-uploads
```

2. **Configure CORS**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

3. **Create IAM User** with S3 permissions
4. **Get Access Keys**
5. **Update Environment Variables**

## Email Service Setup

### Option 1: Gmail

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use in environment:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Option 2: SendGrid

1. Create SendGrid account
2. Generate API key
3. Update email service to use SendGrid

## SMS Service Setup (Twilio)

1. Create Twilio account
2. Get phone number
3. Get Account SID and Auth Token
4. Update environment variables

## Domain Setup

1. **Purchase Domain** (Namecheap, GoDaddy, etc.)
2. **Add DNS Records**:

For API:
```
Type: A
Host: api
Value: YOUR_SERVER_IP
```

For Web (if applicable):
```
Type: A
Host: @
Value: YOUR_SERVER_IP
```

3. **Update CORS** in backend to allow your domain

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm install
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "quickcommerce-api"
        heroku_email: "your-email@example.com"
```

## Monitoring & Logging

### Backend Monitoring

1. **Heroku Logs**
```bash
heroku logs --tail
```

2. **PM2 Monitoring**
```bash
pm2 monit
pm2 logs
```

3. **New Relic** (Application Performance Monitoring)
```bash
npm install newrelic
```

### Error Tracking

1. **Sentry**
```bash
npm install @sentry/node
```

Configure in `server.js`:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "YOUR_DSN" });
```

## Security Checklist

- [ ] All environment variables secured
- [ ] Database uses strong passwords
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Sensitive data encrypted
- [ ] Regular security updates
- [ ] Firewall configured
- [ ] Backup strategy in place

## Performance Optimization

1. **Enable Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Add Caching**
```javascript
const redis = require('redis');
const client = redis.createClient();
```

3. **Database Indexing**
```javascript
userSchema.index({ email: 1, phone: 1 });
```

4. **CDN for Static Assets** (CloudFront, Cloudflare)

## Backup Strategy

### MongoDB Backup

```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Automated with cron
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backup/$(date +\%Y\%m\%d)
```

### S3 Versioning
Enable versioning in S3 bucket settings

## Post-Deployment Testing

1. Test all API endpoints
2. Verify email/SMS sending
3. Test image uploads
4. Verify authentication flow
5. Test from mobile app
6. Monitor logs for errors
7. Check performance metrics

## Rollback Plan

### Heroku
```bash
heroku releases
heroku rollback v123
```

### PM2
```bash
pm2 save  # Before deploy
pm2 resurrect  # To rollback
```

## Support & Maintenance

- Monitor application logs daily
- Review error tracking weekly
- Update dependencies monthly
- Security patches immediately
- Database backups daily
- Performance review monthly

## Cost Estimation

### Free Tier Options
- **Heroku**: Free dyno (sleeps after 30 min)
- **MongoDB Atlas**: 512MB free
- **AWS S3**: 5GB free for 12 months
- **Render**: Free tier available

### Paid Options
- **Heroku**: $7-$25/month per dyno
- **MongoDB Atlas**: $9+/month
- **AWS EC2**: $5+/month
- **Twilio**: Pay as you go
- **SendGrid**: $15+/month

## Troubleshooting

### Common Issues

1. **App crashes on startup**
   - Check logs
   - Verify environment variables
   - Check MongoDB connection

2. **502 Bad Gateway**
   - Check if app is running
   - Verify port configuration
   - Check Nginx config

3. **Database connection timeout**
   - Check whitelist IPs
   - Verify connection string
   - Check network settings

## Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
