# ContentWatch Backend

ContentWatch Backend is a server-side application designed to manage and monitor content efficiently. This repository contains the backend logic, API endpoints, and integrations required for the ContentWatch platform.

## Features

- RESTful API for content management
- User authentication and authorization
- Content moderation and reporting
- Integration with external services
- Logging and error handling
## Technologies Used

- **Node.js** – JavaScript runtime environment
- **Express.js** – Web framework for building APIs
- **MongoDB** – NoSQL database for data storage
- **Mongoose** – ODM for MongoDB
- **JWT** – Authentication and authorization
- **Winston** – Logging
- **Jest** – Testing framework
- **Swagger** – API documentation

## Endpoints

| Method | Endpoint                       | Description                                 |
|--------|------------------------------- |---------------------------------------------|
| POST   | `/api/auth/register`           | Register a new user                         |
| POST   | `/api/auth/login`              | User login                                  |
| GET    | `/api/auth/logout`             | User logout                                 |
| GET    | `/api/auth/me`                 | Get current authenticated user              |
| GET    | `/api/content`                 | Get all content                             |
| POST   | `/api/content`                 | Create new content                          |
| GET    | `/api/content/:id`             | Get content by ID                           |
| PUT    | `/api/content/:id`             | Update content by ID                        |
| DELETE | `/api/content/:id`             | Delete content by ID                        |
| POST   | `/api/content/:id/report`      | Report content for moderation               |
| GET    | `/api/content/:id/reports`     | Get reports for a specific content item     |
| GET    | `/api/users`                   | Get all users (admin only)                  |
| GET    | `/api/users/me`                | Get current user profile                    |
| PUT    | `/api/users/me`                | Update current user profile                 |
| DELETE | `/api/users/me`                | Delete current user account                 |
| GET    | `/api/users/:id`               | Get user by ID (admin only)                 |
| PUT    | `/api/users/:id`               | Update user by ID (admin only)              |
| DELETE | `/api/users/:id`               | Delete user by ID (admin only)              |
| GET    | `/api/moderation/reports`      | Get all content reports (admin/moderator)   |
| PUT    | `/api/moderation/reports/:id`  | Update report status (admin/moderator)      |
| GET    | `/api/health`                  | Health check endpoint                       |
