# API Contracts

All responses use the application-level types from `@product-catalogue/shared`.
Errors use `ApiError` (`message` and `statusCode`). Product data returned by this
API is mapped to the `Product` model; upstream provider response types are not
part of the public contract.

## `GET /api/products`

Returns all products. There are no required parameters.

**200 OK**

```json
[
  {
    "id": 1,
    "title": "Example product",
    "price": 19.99,
    "description": "A product description.",
    "category": "electronics",
    "image": "https://example.com/product.jpg",
    "rating": {
      "rate": 4.5,
      "count": 10
    }
  }
]
```

The response body is `Product[]`; an empty catalogue returns `[]`.

## `GET /api/products/featured`

Returns the featured products. There are no required parameters.

**200 OK** — response body is `Product[]`.

```json
[
  {
    "id": 1,
    "title": "Example product",
    "price": 19.99,
    "description": "A product description.",
    "category": "electronics",
    "image": "https://example.com/product.jpg",
    "rating": {
      "rate": 4.5,
      "count": 10
    }
  }
]
```

## `GET /api/products?search={query}`

Searches products using the optional `search` query parameter. When omitted,
the request returns all products as described above. A supplied query must be
non-empty and URL-encoded.

**Example request:** `GET /api/products?search=wireless%20headphones`

**200 OK** — response body is `Product[]`; no matches returns `[]`.

```json
[
  {
    "id": 1,
    "title": "Wireless headphones",
    "price": 49.99,
    "description": "Over-ear wireless headphones.",
    "category": "electronics",
    "image": "https://example.com/headphones.jpg",
    "rating": {
      "rate": 4.2,
      "count": 18
    }
  }
]
```

**400 Bad Request** — empty or repeated `search` value.

## `GET /api/products/:id`

Returns one product. `id` is a positive integer path parameter.

**Example request:** `GET /api/products/1`

**200 OK** — response body is one `Product` object, as shown above.

**400 Bad Request** — `id` is not a positive integer.  
**404 Not Found** — no product has that ID.

## `GET /api/categories`

Returns the available category names. There are no required parameters.

**200 OK** — response body is `string[]`.

```json
["electronics", "jewelery"]
```

## `GET /api/categories/:category/products`

Returns featured and additional products for the URL-encoded `category` path
parameter.

**Example request:** `GET /api/categories/electronics/products`

**200 OK** — response body is `CategoryProductsResponse`.

```json
{
  "featuredProducts": [
    {
      "id": 1,
      "title": "Example product",
      "price": 19.99,
      "description": "A product description.",
      "category": "electronics",
      "image": "https://example.com/product.jpg",
      "rating": {
        "rate": 4.5,
        "count": 10
      }
    }
  ],
  "additionalProducts": []
}
```

An existing category with no products returns empty arrays.  
**404 Not Found** — category does not exist.

## `POST /api/enquiries`

Submits an enquiry about a product. The request body is `EnquiryRequest`; all
fields are required.

**Example request:**

```http
POST /api/enquiries
Content-Type: application/json
```

```json
{
  "productId": 1,
  "name": "Alex Example",
  "email": "alex@example.com",
  "phone": "+1-555-0100",
  "message": "Is this product available?"
}
```

**201 Created** — response body is `EnquiryResponse`.

```json
{
  "success": true,
  "message": "Enquiry received."
}
```

**400 Bad Request** — missing or invalid request fields. `phone` must contain
7–15 digits, may start with `+`, and may include spaces, parentheses, periods,
or hyphens.
**404 Not Found** — the referenced product does not exist.

**502 Bad Gateway** — the enquiry email could not be delivered. A success response
is returned only after the SMTP server accepts the message.

## Error response

For error statuses, the response body is `ApiError`, and `statusCode` matches
the HTTP status. Any endpoint may return `500 Internal Server Error` with this
shape if an unexpected server error occurs. `502 Bad Gateway` is returned if
the external product provider or SMTP email delivery is unavailable.

```json
{
  "message": "Product not found.",
  "statusCode": 404
}
```
