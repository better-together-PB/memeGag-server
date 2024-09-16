# Social Media App

## Overview

This application is a social media platform where users can create posts, comment on them, like posts and comments, and manage their profiles. The API endpoints are designed to handle user authentication, post creation, commenting, liking, and user profile management.

## Features

- **User Authentication**: Sign up, login, and verify users.
- **Posts**: Create, update, delete, and like posts.
- **Comments**: Add, like, and delete comments on posts.
- **User Profiles**: View and manage user profiles and their posts, likes, and comments.

## API Endpoints

### User Routes

- **Get User Details**
  - `GET /user/details/:id`
  - Retrieves details of a user by their ID.

- **Get User Content**
  - `GET /user/:id/:content?`
  - Retrieves a user's likes, posts, or comments based on the content type specified (`likes`, `posts`, `comments`).

### Authentication Routes

- **Sign Up**
  - `POST /auth/signup`
  - Creates a new user.

- **Login**
  - `POST /auth/login`
  - Authenticates a user and returns a JWT.

- **Verify Token**
  - `GET /auth/verify`
  - Verifies the JWT token and returns user details.

### Post Routes

- **Create Post**
  - `POST /post/create`
  - Creates a new post.

- **Get Post**
  - `GET /post/:id`
  - Retrieves a post by its ID.

- **Update Post**
  - `PATCH /post/:postId`
  - Updates the title of a post.

- **Delete Post**
  - `DELETE /post/:postId`
  - Deletes a post by its ID.

- **Like Post**
  - `POST /post/:postId/like`
  - Likes or unlikes a post.

### Comment Routes

- **Add Comment**
  - `POST /post/:id/comment`
  - Adds a comment to a post.

- **Get Comments**
  - `GET /post/:id/comments`
  - Retrieves all comments for a specific post.

- **Like/Dislike Comment**
  - `POST /post/:postId/:commentId/like`
  - Likes or unlikes a comment.

- **Delete Comment**
  - `DELETE /post/:postId/:commentId`
  - Deletes a comment.

## Middleware

- **getUserInfo**: Middleware to populate `req.userId` with the authenticated user's ID.
- **isAuthenticated**: Middleware to ensure the user is authenticated.
- **isOwner**: Middleware to check if the request user is the owner of the resource (post or comment).

## Visit website
https://memegag.netlify.app/
