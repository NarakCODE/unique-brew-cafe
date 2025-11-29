# Documentation Index

Welcome to the Corner Coffee API documentation. This index will help you find the information you need.

## Quick Start

1. **[README.md](README.md)** - Start here for setup and overview
2. **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Learn about authentication
3. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Detailed endpoint reference

## Documentation Files

### Getting Started

- **[README.md](README.md)**
  - Project overview and features
  - Installation and setup instructions
  - Environment configuration
  - Quick start guide
  - Available scripts

### API Reference

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
  - Complete endpoint reference
  - Request/response examples
  - Error codes and handling
  - Pagination and rate limiting
  - Testing with Postman

- **[openapi.yaml](openapi.yaml)**
  - OpenAPI 3.0 specification
  - Machine-readable API definition
  - Import into Swagger UI or other tools
  - Complete schema definitions

### Authentication & Security

- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)**
  - Authentication flow diagrams
  - JWT token structure and lifecycle
  - Role-based access control (RBAC)
  - Implementation examples (JavaScript, Python)
  - Security best practices
  - Troubleshooting guide

### Testing

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)**
  - How to test API endpoints
  - Swagger UI setup and usage
  - Postman collection guide
  - cURL examples
  - Common test scenarios
  - Troubleshooting

- **[Corner_Coffee_Complete_API.postman_collection.json](Corner_Coffee_Complete_API.postman_collection.json)**
  - Postman collection with example requests
  - Pre-configured environment variables
  - Automatic token management
  - Import into Postman for testing

### Architecture & Design

- **[API_DESIGN_SPECIFICATION.md](API_DESIGN_SPECIFICATION.md)**
  - System architecture
  - Design patterns
  - Component structure

- **[DATABASE_MODEL_DESIGN.md](DATABASE_MODEL_DESIGN.md)**
  - Database schema
  - Model relationships
  - Indexes and optimization

### Implementation Guides

- **[RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md)**
  - Role-based access control implementation
  - Authorization middleware
  - Permission matrix

- **[PAYMENT_API_GUIDE.md](PAYMENT_API_GUIDE.md)**
  - Payment processing flow
  - Payment provider integration
  - Error handling

- **[PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)**
  - Database optimization
  - Caching strategies
  - Query performance

## Documentation by User Type

### For Developers

**First Time Setup:**

1. [README.md](README.md) - Installation and configuration
2. [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Understand auth flow
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Explore endpoints

**Integration:**

1. [openapi.yaml](openapi.yaml) - Generate client SDKs
2. [Corner_Coffee_Complete_API.postman_collection.json](Corner_Coffee_Complete_API.postman_collection.json) - Test endpoints
3. [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Implement auth

**Troubleshooting:**

1. [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Auth issues
2. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Error codes
3. [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Performance issues

### For API Consumers

**Getting Started:**

1. [README.md](README.md) - Overview and features
2. [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - How to authenticate
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Available endpoints

**Common Tasks:**

- **User Registration & Login**: [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)
- **Browse Products**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md#store-endpoints)
- **Manage Cart**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md#cart-endpoints)
- **Place Orders**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md#order-endpoints)
- **Track Orders**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md#track-order)

### For System Administrators

**Setup & Configuration:**

1. [README.md](README.md) - Environment setup
2. [DATABASE_MODEL_DESIGN.md](DATABASE_MODEL_DESIGN.md) - Database setup
3. [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Optimization

**Management:**

1. [API_DOCUMENTATION.md](API_DOCUMENTATION.md#admin-endpoints) - Admin endpoints
2. [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) - User roles and permissions
3. [API_DOCUMENTATION.md](API_DOCUMENTATION.md#reports) - Analytics and reporting

## API Endpoints by Category

### Public Endpoints (No Authentication)

- Authentication (register, login, password reset)
- Store browsing
- Product catalog
- Health check

### User Endpoints (Authentication Required)

- Profile management
- Cart operations
- Order placement and tracking
- Favorites
- Search history
- Addresses
- Notifications

### Admin Endpoints (Admin Role Required)

- Store management
- Product management
- Category management
- Order management
- User management
- Reports and analytics
- System configuration
- Support tickets

## Tools & Resources

### API Testing

- **Postman**: Import [Corner_Coffee_Complete_API.postman_collection.json](Corner_Coffee_Complete_API.postman_collection.json)
- **Swagger UI**: Use [openapi.yaml](openapi.yaml)
- **cURL**: Examples in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Code Generation

- **OpenAPI Generator**: Generate client SDKs from [openapi.yaml](openapi.yaml)
- **Postman Code Generator**: Generate code snippets from Postman collection

### Monitoring

- Health check endpoint: `GET /api/config/health`
- See [API_DOCUMENTATION.md](API_DOCUMENTATION.md#health-check)

## Support

- **Email**: support@cornercoffee.com
- **Documentation Issues**: Create an issue in the repository
- **API Questions**: Refer to [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Version History

- **v1.0.0** (Current)
  - Initial release
  - Complete RBAC implementation
  - Full feature set

## Contributing

When updating documentation:

1. Keep examples up to date
2. Update version numbers
3. Add new endpoints to all relevant docs
4. Test all code examples
5. Update this index if adding new documentation files

---

**Last Updated**: January 2024
