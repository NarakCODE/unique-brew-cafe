# Performance Optimization Guide

This document outlines the performance optimizations implemented in the RBAC API system.

## Overview

The following optimizations have been implemented to improve API performance, scalability, and database efficiency:

1. **Pagination** - All list endpoints now support pagination
2. **Connection Pooling** - Optimized MongoDB connection pool configuration
3. **Query Performance Logging** - Monitor and identify slow queries
4. **Database Indexes** - Comprehensive index strategy for optimal query performance
5. **Query Projection** - Limit returned fields to reduce data transfer

## 1. Pagination

### Implementation

All list endpoints now support pagination with the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - Sort direction: 'asc' or 'desc' (default: 'desc')

### Example Requests

```bash
# Get first page of orders (20 items)
GET /api/orders?page=1&limit=20

# Get second page with custom limit
GET /api/orders?page=2&limit=50

# Sort by status ascending
GET /api/orders?sortBy=status&sortOrder=asc

# Get products with pagination and filters
GET /api/products?page=1&limit=20&categoryId=123&isFeatured=true
```

### Response Format

All paginated endpoints return data in this format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Affected Endpoints

- `GET /api/orders` - User orders with filters
- `GET /api/users` - Admin user management
- `GET /api/products` - Product catalog
- `GET /api/stores` - Store listings
- `GET /api/stores/admin/all` - Admin store management

## 2. Connection Pooling

### Configuration

MongoDB connection pool is configured with optimal settings:

```typescript
{
  maxPoolSize: 10,        // Maximum connections
  minPoolSize: 2,         // Minimum connections to maintain
  maxIdleTimeMS: 30000,   // Close idle connections after 30s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true
}
```

### Benefits

- **Reduced Latency**: Reuse existing connections instead of creating new ones
- **Better Resource Management**: Automatic connection cleanup
- **Improved Reliability**: Automatic retry for transient failures

## 3. Query Performance Logging

### Features

- Automatic detection of slow queries (>100ms)
- Detailed query logging in development mode
- Query statistics tracking
- Performance metrics collection

### Usage

Query performance monitoring is automatically enabled in development mode. To enable in production:

```bash
ENABLE_QUERY_LOGGING=true
```

### Viewing Query Stats

Query statistics are logged automatically. Slow queries are logged with:

- Collection name
- Operation type
- Execution time
- Query details

## 4. Database Indexes

### Index Strategy

Comprehensive indexes have been defined for all models to optimize common query patterns:

#### User Model

- `email` (unique)
- `phoneNumber` (unique)
- `role`
- `status`
- `referralCode` (unique)
- `createdAt`

#### Store Model

- `slug` (unique)
- `isActive`
- `city`
- `location` (2dsphere for geospatial queries)
- `createdAt`

#### Product Model

- `slug` (unique)
- `categoryId`
- `isAvailable`
- `isFeatured`
- `isBestSelling`
- `displayOrder`
- `deletedAt`
- `basePrice`
- `tags`
- `name, description` (text search)

#### Order Model

- `orderNumber` (unique)
- `userId, createdAt` (compound)
- `storeId, createdAt` (compound)
- `status`
- `paymentStatus`
- `userId, status` (compound)

#### Cart Model

- `userId, status` (unique for active carts)
- `storeId`
- `expiresAt` (TTL index)

#### Notification Model

- `userId, isRead, createdAt` (compound)
- `userId, type` (compound)

### Verifying Indexes

In development mode, indexes are automatically verified on startup. To manually verify:

```typescript
import { verifyIndexes } from './utils/indexOptimization.js';
await verifyIndexes();
```

### Creating Missing Indexes

To create missing indexes (use with caution in production):

```typescript
import { createMissingIndexes } from './utils/indexOptimization.js';
await createMissingIndexes();
```

## 5. Query Projection

### Implementation

All queries now use projection to limit returned fields:

```typescript
// Exclude sensitive fields
User.find(query).select('-password');

// Exclude version key
Product.find(query).select('-__v');

// Exclude internal notes for non-admin users
Order.find(query).select('-internalNotes');
```

### Benefits

- **Reduced Data Transfer**: Less data sent over the network
- **Improved Response Times**: Faster serialization
- **Better Security**: Sensitive fields automatically excluded

## Performance Best Practices

### For Developers

1. **Always use pagination** for list endpoints
2. **Use indexes** for frequently queried fields
3. **Limit returned fields** with projection
4. **Monitor slow queries** in development
5. **Test with realistic data volumes**

### Query Optimization Tips

1. **Use compound indexes** for multi-field queries
2. **Avoid $or queries** when possible
3. **Use covered queries** (query + projection using same index)
4. **Limit result sets** with pagination
5. **Use aggregation pipeline** for complex queries

### Example: Optimized Query

```typescript
// Bad: No pagination, no projection
const orders = await Order.find({ userId }).sort({ createdAt: -1 });

// Good: With pagination and projection
const orders = await Order.find({ userId })
  .select('-internalNotes')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
```

## Monitoring and Metrics

### Key Metrics to Monitor

1. **Query Execution Time**: Track slow queries (>100ms)
2. **Connection Pool Usage**: Monitor active connections
3. **Response Times**: API endpoint latency
4. **Database Load**: CPU and memory usage
5. **Index Usage**: Verify indexes are being used

### Tools

- MongoDB Atlas Performance Advisor
- Application logs (slow query warnings)
- Query explain plans
- Connection pool metrics

## Future Optimizations

### Planned Improvements

1. **Redis Caching**: Cache frequently accessed data
2. **Cursor-Based Pagination**: For large datasets
3. **Query Result Caching**: Cache expensive queries
4. **Database Sharding**: For horizontal scaling
5. **Read Replicas**: Distribute read load

### Caching Strategy (Future)

```typescript
// Example: Cache product catalog
const cacheKey = `products:${categoryId}:${page}`;
let products = await redis.get(cacheKey);

if (!products) {
  products = await Product.find(query).limit(limit);
  await redis.setex(cacheKey, 300, JSON.stringify(products)); // 5 min TTL
}
```

## Troubleshooting

### Slow Queries

If you encounter slow queries:

1. Check if appropriate indexes exist
2. Review query patterns in logs
3. Use `explain()` to analyze query execution
4. Consider adding compound indexes
5. Optimize query filters

### High Connection Count

If connection pool is exhausted:

1. Increase `maxPoolSize` if needed
2. Check for connection leaks
3. Ensure queries use `.lean()` for read-only operations
4. Review long-running queries

### Memory Issues

If experiencing high memory usage:

1. Reduce pagination `limit`
2. Use projection to limit fields
3. Avoid loading large documents
4. Use streaming for large result sets

## Testing Performance

### Load Testing

Use tools like Apache Bench or Artillery to test performance:

```bash
# Test orders endpoint with pagination
ab -n 1000 -c 10 "http://localhost:3000/api/orders?page=1&limit=20"

# Test with authentication
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/products?page=1&limit=20"
```

### Benchmarking

Compare performance before and after optimizations:

1. Measure response times
2. Monitor database query times
3. Track memory usage
4. Measure throughput (requests/second)

## Conclusion

These performance optimizations provide a solid foundation for a scalable API. Continue monitoring performance metrics and adjust configurations as needed based on actual usage patterns.

For questions or issues, refer to the MongoDB documentation or consult with the development team.
