# Site Profile API Documentation

This document describes the API endpoints available for fetching site/company profile data.

## Base URL

All endpoints are prefixed with `/api/site/[slug]/` where `[slug]` is the company slug.

## Endpoints

### GET /api/site/[slug]/profile

Returns the core company/location profile data.

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "string",
      "name": "string",
      "slug": "string",
      "tagline": "string | null",
      "description": "string | null",
      "logoUrl": "string | null",
      "bannerUrl": "string | null",
      "contactEmail": "string",
      "contactPhone": "string | null",
      "address": "string | null",
      "category": "string",
      "currency": "string",
      "locale": "string",
      "socialLinks": [{ "id": "string", "channel": "string", "url": "string" }],
      "coreValues": [{ "id": "string", "title": "string", "description": "string", "icon": "string" }],
      "storeCategories": [...],
      "locations": [...]
    },
    "team": {
      "experts": [...],
      "doctors": [...],
      "writers": [...],
      "educators": [...],
      "salesAgents": [...]
    },
    "faqs": [{ "id": "string", "question": "string", "answer": "string", "order": 0 }]
  }
}
```

### GET /api/site/[slug]/blog

Returns blog entries for the company.

**Query Parameters:**
- `limit` (number, optional): Results per page (1-100, default: 10)
- `cursor` (string, optional): Pagination cursor
- `sort` (string, optional): Sort order ('asc' | 'desc', default: 'desc')
- `status` (string, optional): Filter by status ('DRAFT' | 'PUBLISHED' | 'ARCHIVED')
- `tags` (string, optional): Comma-separated list of tags
- `search` (string, optional): Search in title and content

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "excerpt": "string | null",
      "coverImage": "string | null",
      "categories": ["string"],
      "tags": ["string"],
      "authorName": "string | null",
      "status": "string",
      "publishedAt": "string | null",
      "views": 0,
      "likes": 0,
      "contentType": "string",
      "createdAt": "string"
    }
  ],
  "pagination": {
    "total": 0,
    "hasMore": false,
    "nextCursor": "string | undefined"
  }
}
```

### GET /api/site/[slug]/events

Returns events for the company.

**Query Parameters:**
- `limit` (number, optional): Results per page (1-100, default: 10)
- `cursor` (string, optional): Pagination cursor
- `sort` (string, optional): Sort order ('asc' | 'desc', default: 'asc')
- `status` (string, optional): Filter by event status
- `search` (string, optional): Search in title and description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "startDateTime": "string",
      "endDateTime": "string | null",
      "location": "string | null",
      "eventStatus": "string",
      "eventType": "string",
      "maxCapacity": 0,
      "isOnline": false,
      "imageUrl": "string | null",
      "price": 0,
      "isPaid": false,
      "createdAt": "string"
    }
  ],
  "pagination": { ... }
}
```

### GET /api/site/[slug]/products

Returns products and marketplace listings for the company.

**Query Parameters:**
- `limit` (number, optional): Results per page (1-100, default: 12)
- `cursor` (string, optional): Pagination cursor
- `sort` (string, optional): Sort order
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category
- `tags` (string, optional): Comma-separated list of tags
- `search` (string, optional): Search in name and description
- `type` (string, optional): Type to return ('products' | 'listings' | 'all', default: 'all')

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "string",
        "name": "string",
        "description": "string | null",
        "images": [],
        "category": "string | null",
        "tags": ["string"],
        "sellingPrice": 0,
        "finalPrice": 0,
        "discount": 0,
        "isAvailable": true,
        "isFeatured": false,
        "isNewArrival": false,
        "status": "string",
        "createdAt": "string"
      }
    ],
    "listings": [...]
  }
}
```

### GET /api/site/[slug]/media

Returns media assets (photos, videos, albums) for the company.

**Query Parameters:**
- `limit` (number, optional): Results per page (1-100, default: 12)
- `cursor` (string, optional): Pagination cursor
- `sort` (string, optional): Sort order
- `type` (string, optional): Type to return ('photos' | 'videos' | 'photoAlbums' | 'videoAlbums' | 'all', default: 'all')
- `status` (string, optional): Filter by status (for videos)

**Response:**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "string",
        "imageUrl": "string",
        "altText": "string | null",
        "title": "string | null",
        "description": "string | null",
        "tags": ["string"],
        "createdAt": "string"
      }
    ],
    "videos": [...],
    "photoAlbums": [...],
    "videoAlbums": [...]
  }
}
```

### GET /api/site/[slug]/services

Returns services and pricing tiers for the company.

**Query Parameters:**
- `limit` (number, optional): Results per page (1-100, default: 20)
- `cursor` (string, optional): Pagination cursor
- `sort` (string, optional): Sort order
- `status` (string, optional): Filter by status ('ACTIVE' | 'INACTIVE' | 'ARCHIVED')
- `includeTestimonials` (boolean, optional): Include testimonials in response

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "string",
        "name": "string",
        "description": "string | null",
        "price": 0,
        "duration": "string",
        "status": "string",
        "createdAt": "string"
      }
    ],
    "pricingTiers": [...],
    "testimonials": [...] // Only if includeTestimonials=true
  },
  "pagination": { ... }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (company/resource not found)
- `500`: Internal Server Error

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, cache-control, x-api-key, X-Requested-With`

## Profile Pages

The following profile pages are available for each vertical:

- `/site/[slug]/blog/profile` - Blog profile page
- `/site/[slug]/nonprofit/profile` - Nonprofit profile page
- `/site/[slug]/events/profile` - Events profile page
- `/site/[slug]/realestate/profile` - Real estate profile page
- `/site/[slug]/media/profile` - Media profile page
- `/site/[slug]/finance/profile` - Finance profile page
- `/site/[slug]/automotive/profile` - Automotive profile page
- `/site/[slug]/travel/profile` - Travel profile page
- `/site/[slug]/fitness/profile` - Fitness profile page
- `/site/[slug]/security/profile` - Security profile page
- `/site/[slug]/consultant/profile` - Consultant profile page
- `/site/[slug]/publicspeaking/profile` - Public speaking profile page

All pages support ISR (Incremental Static Regeneration) with a default revalidation time of 5 minutes.

## Setup Instructions

1. Ensure the database is properly configured with a valid `DATABASE_URL` environment variable
2. Run `npx prisma generate` to generate the Prisma client
3. Run `npm run build` to build the application
4. The API endpoints and profile pages will be available at the paths described above

## Example Usage

### Fetch profile data
```javascript
const response = await fetch('/api/site/my-company/profile');
const data = await response.json();
if (data.success) {
  console.log(data.data.profile);
}
```

### Fetch blog posts with pagination
```javascript
const response = await fetch('/api/site/my-company/blog?limit=10&status=PUBLISHED');
const data = await response.json();
if (data.success) {
  console.log(data.data); // Array of blog posts
  if (data.pagination.hasMore) {
    // Fetch next page with cursor
    const nextPage = await fetch(`/api/site/my-company/blog?cursor=${data.pagination.nextCursor}`);
  }
}
```
