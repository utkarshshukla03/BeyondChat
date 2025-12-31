# Production Deployment Guide

## Pre-Deployment Checklist

### Backend (Laravel)
- [ ] Update `.env` with production database credentials
- [ ] Set `APP_DEBUG=false`
- [ ] Run migrations in production: `php artisan migrate --env=production`
- [ ] Clear application cache: `php artisan cache:clear`
- [ ] Optimize autoloader: `composer install --optimize-autoloader --no-dev`
- [ ] Configure proper CORS origins for frontend domain
- [ ] Setup error logging (Sentry, DataDog)
- [ ] Configure backup strategy for database
- [ ] Setup SSL/HTTPS certificates
- [ ] Configure SMTP for email notifications
- [ ] Test all API endpoints
- [ ] Setup rate limiting
- [ ] Enable HTTPS redirect

### Enhancement Engine (Node.js)
- [ ] Update `.env` with production API credentials
- [ ] Use real API keys (OpenAI, Google Search, etc.)
- [ ] Configure error tracking (Sentry)
- [ ] Setup logging service (CloudWatch, Loggly)
- [ ] Configure PM2 or systemd for process management
- [ ] Setup monitoring and alerting
- [ ] Configure backup for failed articles
- [ ] Test LLM API quota
- [ ] Configure rate limiting
- [ ] Setup auto-restart on failure

### Frontend (React)
- [ ] Update `.env` with production API URL
- [ ] Build optimized bundle: `npm run build`
- [ ] Setup CDN for static assets
- [ ] Configure gzip compression
- [ ] Enable caching headers
- [ ] Test all routes
- [ ] Verify mobile responsiveness
- [ ] Setup analytics (Google Analytics, Mixpanel)
- [ ] Configure error tracking (Sentry)
- [ ] Setup SSL certificate
- [ ] Enable HTTP/2

## Deployment Options

### Option 1: Traditional VPS (Recommended for Beginners)

#### Server Setup
```bash
# Update system
sudo apt update && apt upgrade -y

# Install dependencies
sudo apt install -y php8.2 php8.2-{mysql,mbstring,zip,gd,curl,dom} \
                     composer nodejs npm mysql-server nginx

# Create app directory
sudo mkdir -p /var/www/beyondchat
cd /var/www/beyondchat

# Clone repository
git clone <repo-url> .

# Install dependencies
composer install --no-dev
npm install --prefix frontend-react
npm install --prefix content-enhancer
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.beyondchat.com;

    root /var/www/beyondchat/backend-laravel/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Enable gzip
    gzip on;
    gzip_types text/css application/javascript application/json;
}

server {
    listen 80;
    server_name beyondchat.com;

    root /var/www/beyondchat/frontend-react/dist;

    location / {
        try_files $uri /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

#### SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx

# For API
sudo certbot --nginx -d api.beyondchat.com

# For Frontend
sudo certbot --nginx -d beyondchat.com
```

#### Process Management (PM2)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'beyondchat-enhancer',
      script: './content-enhancer/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### Option 2: Docker Containerization

#### Dockerfile for Backend
```dockerfile
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libmysqlclient-dev \
    libzip-dev \
    unzip \
    git \
    curl

RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY backend-laravel ./

RUN composer install --no-dev --optimize-autoloader

EXPOSE 9000

CMD ["php-fpm"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: beyondchat
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build:
      context: .
      dockerfile: backend-laravel/Dockerfile
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_DATABASE: beyondchat
      DB_USERNAME: root
      DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./backend-laravel:/app
    ports:
      - "8000:9000"

  frontend:
    build:
      context: ./frontend-react
    ports:
      - "3000:3000"
    command: npm run dev

  enhancer:
    build:
      context: ./content-enhancer
    environment:
      LARAVEL_API_BASE_URL: http://backend:9000/api
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - backend

volumes:
  db_data:
```

---

### Option 3: Platform-as-a-Service (PaaS)

#### Heroku Deployment

**Backend**
```bash
cd backend-laravel
heroku create beyondchat-api
heroku addons:create cleardb:ignite
git push heroku main
heroku run php artisan migrate
```

**Frontend**
```bash
cd frontend-react
heroku create beyondchat-frontend
heroku buildpacks:add mars/create-react-app
git push heroku main
```

#### Vercel (Frontend)
```bash
cd frontend-react
npm install -g vercel
vercel deploy --prod
```

---

### Option 4: Cloud Platforms

#### AWS Deployment

**Elastic Beanstalk (Backend)**
```bash
cd backend-laravel
eb init
eb create beyondchat-env
eb deploy
```

**S3 + CloudFront (Frontend)**
```bash
cd frontend-react
npm run build
aws s3 sync dist/ s3://beyondchat-bucket
```

#### Google Cloud Platform

**Cloud Run (Backend)**
```bash
cd backend-laravel
gcloud run deploy beyondchat-api \
  --source . \
  --platform managed \
  --region us-central1
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Test API health
curl https://api.beyondchat.com/api/health

# Test frontend
curl https://beyondchat.com

# Monitor enhancement engine logs
pm2 logs beyondchat-enhancer
```

### Database Maintenance
```bash
# Backup database
mysqldump -u root -p beyondchat > backup_$(date +%Y%m%d).sql

# Optimize tables
OPTIMIZE TABLE articles;

# Check table status
CHECK TABLE articles;
```

### Log Rotation
```bash
# Setup logrotate for nginx
sudo tee /etc/logrotate.d/nginx > /dev/null << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate {
        if [ -d /etc/logrotate.d/httpd-prerotate.d ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate.d; \
        fi
    }
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF

# Manually run
sudo logrotate -f /etc/logrotate.d/nginx
```

### Performance Monitoring
```bash
# Monitor server resources
top
htop

# Check database performance
SHOW PROCESSLIST;
SHOW SLOW QUERIES;
```

### Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update PHP packages
composer update

# Update Node packages
npm update

# Check for vulnerabilities
npm audit
composer audit
```

---

## Scaling Strategies

### Horizontal Scaling
- Add load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use database replication
- Setup separate cache layer (Redis)

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching
- Use CDN for static assets

### Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_type_published ON articles(type, published_date);
CREATE INDEX idx_original_id ON articles(original_article_id);

-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM articles WHERE type = 'enhanced';

-- Archive old articles
CREATE TABLE articles_archive LIKE articles;
INSERT INTO articles_archive SELECT * FROM articles WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM articles WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## Disaster Recovery

### Backup Strategy
```bash
#!/bin/bash
# Daily automated backup
BACKUP_DIR="/backups/beyondchat"
DB_NAME="beyondchat"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
mysqldump -u root -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# File backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/beyondchat

# Upload to S3
aws s3 cp $BACKUP_DIR/ s3://beyondchat-backups/

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Restore from Backup
```bash
# Restore database
zcat backup_20240115_120000.sql.gz | mysql -u root -p beyondchat

# Restore application
tar -xzf app_20240115_120000.tar.gz -C /var/www/beyondchat
```

---

## Rollback Plan

### Database Rollback
```bash
# If migration fails
php artisan migrate:rollback

# Rollback to specific batch
php artisan migrate:rollback --step=1
```

### Application Rollback
```bash
# Keep previous versions
git tag v1.0.0
git tag v1.0.1

# Rollback to previous version
git checkout v1.0.0
php artisan serve
```

---

## Post-Deployment Verification

### Checklist
- [ ] All API endpoints responding
- [ ] Database queries executing correctly
- [ ] Frontend loads without errors
- [ ] Search functionality working
- [ ] Pagination working correctly
- [ ] Enhancement engine processing articles
- [ ] HTTPS certificates valid
- [ ] Monitoring alerts active
- [ ] Backups running
- [ ] Logs being collected

### Performance Baseline
```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://api.beyondchat.com/api/articles

# Monitor response times
# Target: < 200ms for API calls
# Target: < 500ms for search queries
```

---

## Support & Maintenance

### Weekly Tasks
- [ ] Check error logs
- [ ] Review monitoring metrics
- [ ] Verify backups completed
- [ ] Check disk space usage

### Monthly Tasks
- [ ] Database optimization
- [ ] Security updates
- [ ] Review performance metrics
- [ ] Archive old logs

### Quarterly Tasks
- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning review
- [ ] Feature performance analysis

---

## Contact & Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Review monitoring dashboard
3. Check system resources: `top`
4. Verify database connectivity
5. Test API endpoints manually

---

**Last Updated**: January 2024  
**Version**: 1.0.0
