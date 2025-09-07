# Environment Configuration Guide

## Security Configuration

To properly secure your application, create a `.env` file in the backend directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_PATH=data/myRefrechefDatabase

# Server Configuration
PORT=3000
```

## Important Security Notes:

1. **JWT_SECRET**: 
   - Generate a strong, random secret key
   - Never commit this to version control
   - Use different secrets for development and production

2. **FRONTEND_URL**: 
   - Set to your frontend's actual URL
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

3. **CORS Security**: 
   - The application now only accepts requests from the specified FRONTEND_URL
   - This prevents unauthorized cross-origin requests

4. **Rate Limiting**: 
   - General API endpoints: 100 requests per 15 minutes per IP
   - Authentication endpoints: 5 attempts per 15 minutes per IP
   - Password reset endpoints: 3 attempts per hour per IP
   - This prevents brute-force attacks and ensures service availability

5. **Database Migrations**: 
   - Uses Knex.js for database schema management
   - Migrations are automatically run on server startup
   - Manual migration commands available for development

## Database Migration Commands:

```bash
# Run all pending migrations
npm run migrate:latest

# Rollback the last migration
npm run migrate:rollback

# Check migration status
npm run migrate:status

# Create a new migration
npm run migrate:make migration_name
```

## Production Deployment:

When deploying to production:
1. Set `FRONTEND_URL` to your production frontend domain
2. Use a strong, randomly generated `JWT_SECRET`
3. Ensure your `.env` file is not committed to version control
4. Consider using environment-specific configuration files 