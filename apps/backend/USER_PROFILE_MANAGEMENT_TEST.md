# User Profile Management - Testing Guide

This document describes how to test the newly implemented user profile management features.

## Implemented Features

### 1. Avatar Upload (Requirement 18.3)

**Endpoint**: `PATCH /api/users/me/avatar`
**Authentication**: Required
**Content-Type**: `multipart/form-data`

**Request**:

```bash
curl -X PATCH http://localhost:3000/api/users/me/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Response**:

```json
{
  "success": true,
  "data": {
    "profileImage": "/uploads/avatars/avatar-1234567890-123456789.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

**Validation**:

- Only image files are accepted (jpg, png, gif, etc.)
- Maximum file size: 5MB
- File is stored in `uploads/avatars/` directory

### 2. Account Deletion with Anonymization (Requirement 18.4)

**Endpoint**: `DELETE /api/users/me`
**Authentication**: Required

**Request**:

```bash
curl -X DELETE http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "user_password",
    "reason": "No longer need the service"
  }'
```

**Response**:

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Anonymization Process**:

- Full name changed to "Deleted User {timestamp}"
- Email changed to "deleted\_{timestamp}@deleted.local"
- Phone number removed
- Profile image removed
- Date of birth removed
- Gender removed
- All notification preferences disabled
- Account status set to "deleted"
- Deletion timestamp recorded

### 3. Email and Phone Validation (Requirement 18.5)

**Endpoint**: `PUT /api/profile`
**Authentication**: Required

**Request with Email**:

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "fullName": "John Doe"
  }'
```

**Request with Phone**:

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "fullName": "John Doe"
  }'
```

**Email Validation**:

- Must be in valid email format (user@domain.com)
- Must not be already taken by another user
- Error response for invalid format:

```json
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Invalid email format"
  }
}
```

**Phone Validation**:

- Must be in international format (+1234567890)
- Accepts spaces and dashes (+12 345 678 90, +12-345-678-90)
- Error response for invalid format:

```json
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Invalid phone number format. Use international format (e.g., +1234567890)"
  }
}
```

## Testing Checklist

### Avatar Upload Tests

- [ ] Upload valid image file (jpg, png, gif)
- [ ] Try to upload non-image file (should fail)
- [ ] Try to upload file larger than 5MB (should fail)
- [ ] Upload without authentication (should return 401)
- [ ] Verify file is saved in uploads/avatars directory
- [ ] Verify profileImage field is updated in database

### Account Deletion Tests

- [ ] Delete account with correct password
- [ ] Try to delete without password (should fail)
- [ ] Try to delete with wrong password (should fail)
- [ ] Verify user data is anonymized in database
- [ ] Verify account status is set to "deleted"
- [ ] Try to login with deleted account (should fail)

### Email Validation Tests

- [ ] Update with valid email format
- [ ] Try invalid email formats:
  - [ ] "notanemail"
  - [ ] "missing@domain"
  - [ ] "@nodomain.com"
  - [ ] "spaces in@email.com"
- [ ] Try to use email already taken by another user
- [ ] Verify email is updated in database

### Phone Validation Tests

- [ ] Update with valid international format (+1234567890)
- [ ] Update with spaces (+12 345 678 90)
- [ ] Update with dashes (+12-345-678-90)
- [ ] Try invalid formats:
  - [ ] "1234567890" (missing +)
  - [ ] "+123" (too short)
  - [ ] "notanumber"
- [ ] Verify phone is updated in database

## Implementation Details

### Files Modified/Created

1. **src/services/userService.ts**
   - Added `validateEmail()` function
   - Added `validatePhoneNumber()` function
   - Updated `updateProfile()` to validate email and phone
   - Updated `deleteAccount()` to anonymize user data
   - Added `uploadAvatar()` method

2. **src/controllers/userController.ts**
   - Added `uploadAvatar()` controller
   - Updated `updateProfile()` to accept email parameter
   - Updated `deleteAccount()` documentation

3. **src/routes/userRoutes.ts**
   - Added `PATCH /me/avatar` route with multer middleware
   - Added `DELETE /me` route

4. **src/config/multer.ts** (NEW)
   - Configured multer for file uploads
   - Set up storage in uploads/avatars directory
   - Added file filter for images only
   - Set 5MB file size limit

5. **.gitignore**
   - Added uploads/ directory to ignore uploaded files

### Dependencies Added

- `multer`: ^1.4.5-lts.1
- `@types/multer`: ^1.4.12

## Notes

- In production, files should be uploaded to cloud storage (S3, Cloudinary, etc.)
- Current implementation stores files locally in uploads/avatars directory
- Ensure uploads/avatars directory exists and has write permissions
- Consider adding image optimization/resizing for avatars
- Consider adding cleanup job for deleted user files
