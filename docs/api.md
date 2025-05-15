# API Documentation

This document provides details about the REST API endpoints available in the application.

## Base URL

All API endpoints are prefixed with `/api`.

## Health Check

### Get API Health Status

```
GET /api/health
```

Returns the health status of the API.

#### Response

```json
{
  "status": "ok",
  "time": "2025-05-15T12:00:00.000Z"
}
```

## Restaurants

### Get All Restaurants

```
GET /api/restaurants
```

Returns a list of all restaurants in the database.

#### Response

```json
[
  {
    "id": 1,
    "name": "Biang Biang Noodles",
    "city": "Seattle",
    "address": "601 E Pike St Unit 100, Seattle, WA 98122",
    "cuisine_type": "Chinese",
    "specialty": "Hand-pulled noodles",
    "yelp_rating": 4.3,
    "price_range": "$$",
    "image_url": "https://example.com/image.png",
    "location": {
      "type": "Point",
      "coordinates": [-122.324140, 47.613896]
    }
  },
  // ... more restaurants
]
```

### Get Restaurant by ID

```
GET /api/restaurants/:id
```

Returns a single restaurant by its ID.

#### Parameters

| Name | Type   | Description          |
|------|--------|----------------------|
| id   | number | The restaurant's ID. |

#### Response

```json
{
  "id": 1,
  "name": "Biang Biang Noodles",
  "city": "Seattle",
  "address": "601 E Pike St Unit 100, Seattle, WA 98122",
  "cuisine_type": "Chinese",
  "specialty": "Hand-pulled noodles",
  "yelp_rating": 4.3,
  "price_range": "$$",
  "image_url": "https://example.com/image.png",
  "location": {
    "type": "Point",
    "coordinates": [-122.324140, 47.613896]
  }
}
```

#### Error Responses

**404 Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Restaurant not found"
  }
}
```

### Get Nearby Restaurants

```
GET /api/restaurants/nearby
```

Returns restaurants within a specified distance from a geographic point.

#### Query Parameters

| Name | Type   | Required | Default | Description                                  |
|------|--------|----------|---------|----------------------------------------------|
| lon  | number | Yes      | -       | Longitude coordinate of the center point.    |
| lat  | number | Yes      | -       | Latitude coordinate of the center point.     |
| km   | number | No       | 5       | Search radius in kilometers around the point.|

#### Response

```json
[
  {
    "id": 1,
    "name": "Biang Biang Noodles",
    "city": "Seattle",
    "address": "601 E Pike St Unit 100, Seattle, WA 98122",
    "cuisine_type": "Chinese",
    "specialty": "Hand-pulled noodles",
    "yelp_rating": 4.3,
    "price_range": "$$",
    "image_url": "https://example.com/image.png",
    "location": {
      "type": "Point",
      "coordinates": [-122.324140, 47.613896]
    },
    "distance_km": 0.5
  },
  // ... more restaurants sorted by distance
]
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "fields": {
      "fieldErrors": {
        "lon": ["Expected number, received string"]
      }
    }
  }
}
```

## Error Handling

All API errors follow a standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message for the client",
    "fields": {
      // Optional field validation errors
    }
  }
}
```

Common error codes:

| Code             | Status Code | Description                                  |
|------------------|-------------|----------------------------------------------|
| NOT_FOUND        | 404         | The requested resource was not found.        |
| VALIDATION_ERROR | 400         | The request parameters failed validation.    |
| INTERNAL_SERVER_ERROR | 500    | An unexpected error occurred on the server.  |