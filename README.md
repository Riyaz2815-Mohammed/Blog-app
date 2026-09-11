# Blog App

A micro-blogging platform where users can post, follow each other, and browse a personalized feed.

## Features

- Register / Login with JWT authentication
- Create, edit, and delete posts (up to 280 characters)
- Like / unlike posts
- Follow and unfollow users
- Personalized home feed (posts from followed users)
- Explore page with all posts and user search
- User profiles with bio, follower/following counts
- Responsive layout (sidebar on desktop, bottom nav on mobile)

## Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Backend   | Node.js, Express, MongoDB, JWT    |
| Frontend  | React 18, Vite, React Router v6   |
| Database  | MongoDB Atlas                     |

## Project Structure

```
Blog-app/
├── backend/
│   ├── server.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   └── routes/
│       ├── auth.js
│       ├── posts.js
│       └── users.js
└── frontend/
    └── src/
        ├── api.js
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Nav.jsx
        │   ├── PostCard.jsx
        │   └── PostForm.jsx
        └── pages/
            ├── Auth.jsx
            ├── Feed.jsx
            ├── Explore.jsx
            └── Profile.jsx
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### Environment Variables (`backend/.env`)

| Variable    | Description                        |
|-------------|------------------------------------|
| `PORT`      | Express port (default 5000)        |
| `MONGO_URI` | MongoDB connection string          |
| `JWT_SECRET`| Secret key for signing JWT tokens  |

## API Reference

### Auth
| Method | Endpoint             | Description     |
|--------|----------------------|-----------------|
| POST   | /api/auth/register   | Register user   |
| POST   | /api/auth/login      | Login user      |

### Posts
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /api/posts/feed           | Home feed (followed)     |
| GET    | /api/posts/explore        | All posts                |
| GET    | /api/posts/user/:username | Posts by a user          |
| POST   | /api/posts                | Create post              |
| PUT    | /api/posts/:id            | Edit post                |
| DELETE | /api/posts/:id            | Delete post              |
| POST   | /api/posts/:id/like       | Toggle like              |

### Users
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | /api/users/me               | Get current user       |
| PUT    | /api/users/me               | Update name/bio        |
| GET    | /api/users/search?q=        | Search users           |
| GET    | /api/users/:username        | Get user profile       |
| POST   | /api/users/:username/follow | Toggle follow          |
