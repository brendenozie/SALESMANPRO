# Site User Profile API Documentation

This document describes the user-scoped API endpoints under `/api/site/[slug]/me/*` that power the user/client profile pages for each vertical.

## Authentication

All endpoints require authentication via NextAuth session. Unauthenticated requests will receive a `401 Unauthorized` response.

## Base URL

All endpoints follow the pattern:
```
/api/site/{slug}/me/{resource}
```

Where:
- `{slug}` - The site/vertical context (e.g., `blog`, `events`, `realestate`)
- `{resource}` - The specific resource type

## Endpoints

### GET /api/site/{slug}/me/profile

Returns the authenticated user's profile data.

**Response:**
```json
{
  "id": "string",
  "name": "string | null",
  "email": "string",
  "phone": "string | null",
  "avatar": "string | null",
  "bio": "string | null",
  "address": "string | null",
  "username": "string | null",
  "role": "string | null",
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string",
  "points": 0,
  "tier": "Standard"
}
```

### PUT /api/site/{slug}/me/profile

Updates the authenticated user's profile.

**Request Body:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "bio": "string (optional)",
  "address": "string (optional)"
}
```

**Response:** Updated user profile object (same as GET response)

---

### GET /api/site/{slug}/me/blog

Returns the user's blog entries.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `published`, `archived`)
- `category` (optional): Filter by category
- `tags` (optional): Comma-separated list of tags
- `limit` (optional, default: 20, max: 100): Number of results per page
- `cursor` (optional): Pagination cursor
- `sort` (optional, default: `desc`): Sort order (`asc` or `desc`)

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "excerpt": "string | null",
      "content": "string | null",
      "category": "string | null",
      "tags": ["string"],
      "featuredImage": "string | null",
      "status": "string",
      "views": 0,
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string",
      "publishedAt": "ISO 8601 date string | null"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/events

Returns the user's events.

**Query Parameters:**
- `status` (optional): Filter by status
- `upcoming` (optional): Set to `true` to only show future events
- `limit` (optional, default: 20): Number of results
- `cursor` (optional): Pagination cursor
- `sort` (optional, default: `desc`): Sort order

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string | null",
      "location": "string | null",
      "imageUrl": "string | null",
      "status": "string",
      "capacity": "number | null",
      "type": "string | null",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/realestate

Returns the user's real estate listings.

**Query Parameters:**
- `status` (optional): Filter by status
- `propertyType` (optional): Filter by property type
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "images": ["string"],
      "price": 0,
      "status": "string",
      "area": "string | null",
      "bedrooms": 0,
      "bathrooms": "string | null",
      "amenities": ["string"],
      "location": "string | null",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/automotive

Returns the user's automotive listings.

**Query Parameters:**
- `status` (optional): Filter by status
- `make` (optional): Filter by vehicle make
- `model` (optional): Filter by vehicle model
- `year` (optional): Filter by year
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "images": ["string"],
      "price": 0,
      "status": "string",
      "make": "string | null",
      "model": "string | null",
      "year": 0,
      "mileage": "string | null",
      "transmission": "string | null",
      "fuelType": "string | null",
      "engineType": "string | null",
      "condition": "string | null",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/travel

Returns the user's travel bookings.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string | null",
      "status": "string",
      "totalPrice": 0,
      "notes": "string | null",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/fitness

Returns the user's fitness programs/enrollments.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "status": "string",
      "course": {
        "id": "string",
        "title": "string",
        "description": "string | null",
        "image": "string | null",
        "duration": "string | null",
        "status": "string | null"
      },
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string",
      "progress": 0,
      "nextSession": "string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/security

Returns the user's security services.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string | null",
      "status": "string",
      "totalPrice": 0,
      "notes": "string | null",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/nonprofit

Returns the user's nonprofit contributions.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "amount": 0,
      "status": "string",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0,
  "totalDonations": 0,
  "hoursVolunteered": 0,
  "treesPlanted": 0
}
```

---

### GET /api/site/{slug}/me/finance

Returns the user's finance data (orders/transactions).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "total": 0,
      "status": "string",
      "items": [
        {
          "id": "string",
          "quantity": 0,
          "price": 0,
          "product": {
            "id": "string",
            "name": "string",
            "image": "string | null"
          }
        }
      ],
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/media

Returns the user's media assets.

**Query Parameters:**
- `type` (optional): Filter by media type
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "images": ["string"],
      "videos": ["string"],
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/orders

Returns the user's orders.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "total": 0,
      "status": "string",
      "date": "ISO 8601 date string",
      "items": [
        {
          "id": "string",
          "quantity": 0,
          "price": 0,
          "product": {
            "id": "string",
            "name": "string",
            "image": "string | null"
          }
        }
      ]
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/wishlist

Returns the user's wishlist items.

**Query Parameters:**
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "product": {
        "id": "string",
        "name": "string",
        "image": "string | null",
        "price": 0
      },
      "createdAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/addresses

Returns the user's saved addresses.

**Query Parameters:**
- `limit`, `cursor`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string | null",
      "label": "string",
      "street": "string | null",
      "city": "string | null",
      "state": "string | null",
      "zip": "string | null",
      "country": "string | null",
      "phone": "string | null",
      "isDefault": false
    }
  ],
  "total": 0
}
```

---

### GET /api/site/{slug}/me/engagements

Returns the user's engagements (consultant/speaker bookings).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "startDate": "ISO 8601 date string",
      "endDate": "ISO 8601 date string | null",
      "status": "string",
      "totalPrice": 0,
      "notes": "string | null",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/resources

Returns the user's digital resources (ebooks, downloads).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "images": ["string"],
      "downloadUrl": "string | null",
      "author": "string | null",
      "createdAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

---

### GET /api/site/{slug}/me/services

Returns the user's services/pricing tiers.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit`, `cursor`, `sort`: Standard pagination parameters

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "images": ["string"],
      "price": 0,
      "status": "string",
      "pricingTiers": [],
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "nextCursor": "string | null",
  "total": 0
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `204 No Content`: Successful request with no content
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User doesn't have access to the resource
- `404 Not Found`: Resource not found or unsupported vertical
- `500 Internal Server Error`: Unexpected server error

Error response body:
```json
{
  "error": "Error type",
  "message": "Detailed error message (optional)",
  "details": {} // Additional details (optional)
}
```

## Pagination

All list endpoints support cursor-based pagination:

1. Initial request: `GET /api/site/{slug}/me/{resource}?limit=20`
2. Subsequent requests: Use the `nextCursor` from the response: `GET /api/site/{slug}/me/{resource}?limit=20&cursor={nextCursor}`
3. When `nextCursor` is `null`, there are no more results.
