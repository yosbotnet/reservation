# Medical Clinic Management System

## Vercel Deployment Guide

### Backend Deployment

1. **Environment Setup**
   - In your Vercel project settings, configure the following environment variables:
     ```
     DATABASE_URL=your_production_database_url
     JWT_SECRET=your_secure_jwt_secret
     NODE_ENV=production
     FRONTEND_URL=your_frontend_url
     ```

2. **Database Configuration**
   - Ensure your database is accessible from Vercel's serverless functions
   - Use connection pooling for better performance
   - Configure proper SSL if required by your database provider

3. **Deployment Steps**
   - Connect your repository to Vercel
   - Set the root directory to `/backend`
   - Set the build command to `npm install`
   - Set the output directory to `src`
   - Deploy using the Vercel dashboard or CLI

4. **Post-Deployment**
   - Verify the health endpoint is working: `https://your-api.vercel.app/health`
   - Check CORS is properly configured with your frontend URL
   - Monitor the Vercel logs for any connection issues

### Performance Optimizations

The backend is optimized for serverless deployment with:
- Connection pooling for database
- Proper CORS configuration
- Caching headers for static responses
- Security headers
- Health check endpoint
- Request timeout handling

### Troubleshooting

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure database is accessible from Vercel's network
4. Monitor the health endpoint for database connectivity
