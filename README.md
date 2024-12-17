# Reflections Project Report

This is a dynamic and interactive platform where users can upload, manage, categorize, and interact with photos. It provides a secure environment for user authentication, admin capabilities, and enhanced user experience through responsive design and interactive features.

# Reflections - A Photo Gallery Application

## Project Overview

The **Reflections - A Photo Gallery Application** is a dynamic and interactive platform where users can upload, manage, categorize, and interact with photos. It provides a secure environment for user authentication, admin capabilities, and enhanced user experience through responsive design and interactive features.

## Table of Contents

1. Introduction
2. Objective
3. Problems Addressed
4. Additional Features
5. Project Functionality
   - Frontend
   - Backend
   - Admin Features
6. Technical Architecture
   - Libraries, Frameworks, and Tools
7. MVC Model Implementation
   - Models
   - Views
   - Controllers
8. Challenges
9. Future Work
10. Conclusion
11. Resources
12. Testing Instructions

---

## Introduction

Our team consists of the following members:

- **Anusha**
- **Harshita**
- **Neha**

The project focuses on building a **Reflections - A Photo Gallery Application** with user authentication, category-based image organization, and interactive features. The application leverages modern web development technologies, including **MongoDB, Express.js, Node.js, and EJS templates**, to provide a user-friendly and functional platform for uploading, managing, and viewing images.

---

## Objective

The primary goal of the project was to develop a dynamic and interactive photo gallery application where users can:

- **Upload and Manage Photos**: Users can upload images with details such as titles, categories, and descriptions.
- **User Authentication**: Implement user registration and login systems with role-based access controls.
- **Categorization**: Photos are organized into categories for better navigation and searchability.
- **Interactivity**: Users can interact with images by adding comments and exploring posts by others.

---

## Problems Addressed

We aimed to address the following problems:

- Building a platform where users can **organize and manage photos** efficiently.
- Implementing **secure authentication** to ensure user data privacy.
- Enabling seamless **categorization and search features** for better user experience.
- Providing **admin capabilities** to manage users and photo categories.

---

## Additional Features

Beyond the listed assignment requirements, we implemented the following features:

1. **Commenting System**: Users can leave comments on photos to foster interaction.
2. **Photo Migration Tool**: A utility script (`migratePhotoCategories.js`) was developed to assist in reorganizing photo categories.
3. **Admin Promotions**: Admins can promote standard users to admin roles using a utility script (`promoToAdmin.js`).
4. **Data Cleanup**: Added functionality to identify and clean orphaned data with the `cleanupOrphanedData.js` script.
5. **Flash Notifications**: Implemented feedback notifications using the `flash.js` utility for a smoother user experience.
6. **Responsive Design**: Ensured the application is responsive by designing modular **CSS files** for key pages like **login**, **gallery**, and **profile views**.

---

## Project Functionality

### Frontend

The frontend focuses on providing a user-friendly and responsive interface using **EJS templates** and **CSS** for design:

- **Pages**:
  - `index.ejs`: Landing page for the application.
  - `login.ejs`: User login form.
  - `register.ejs`: User registration page.
  - `profile.ejs`: Displays user profile with uploaded photos.
  - `gallery.ejs`: Shows categorized photo galleries with interactive filters.
  - `readerPost.ejs`: Displays a single post with photo details and comments.
  - `dashboard.ejs`: Admin dashboard for managing users and photos.
  - `404.ejs`: Custom 404 error page.
- **Stylesheets**:
  - `navbar.css`: Navbar styling.
  - `gallery.css`: Photo gallery page styling.
  - `register.css` and `login.css`: Form styling.
  - `profile.css`: Profile page styling.
  - `readerPost.css`: Individual photo post layout.

### Backend

The backend is powered by **Node.js** and **Express.js**, handling routing, authentication, and database operations:

- **Server Setup**:
  - `server.js`: Main entry point for the server.
- **Middleware**:
  - `auth.js`: Handles user authentication.
  - `isAuthenticated.js`: Middleware for verifying logged-in users.
  - `multerGridFs.js`: Middleware for file uploads using **Multer** and **GridFS**.
- **APIs and Routes**:
  - `promoToAdmin.js`: Script to promote users to admin roles.
  - `cleanupOrphanedData.js`: Script to clean orphaned photos and data.

### Admin Features

Admins have additional capabilities, including:

- Managing user roles (e.g., promoting users to admins).
- Removing unwanted photos and users.
- Organizing and migrating photo categories using utility scripts (`migratePhotoCategories.js`).

---

## Technical Architecture

The project follows a **three-tier architecture** combined with the **MVC (Model-View-Controller)** conceptual model.

### Libraries, Frameworks, and Tools

- **Backend**:
  - **Node.js**: JavaScript runtime environment.
  - **Express.js**: Web framework for routing and middleware.
  - **Mongoose**: ODM for MongoDB to interact with the database.
  - **GridFS**: Storage solution for uploading and managing large files.
  - **Passport.js**: Authentication middleware for user registration and login.
  - **bcrypt**: Library for hashing passwords.
  - **jsonwebtoken**: Used for creating secure tokens.
  - **dotenv**: Loads environment variables.
- **Frontend**:
  - **EJS**: Template engine for rendering dynamic HTML pages.
  - **CSS**: Styling for frontend pages.
  - **Flash.js**: Displays flash notifications for user feedback.
- **Database**:
  - **MongoDB**: NoSQL database for storing user, photo, and comment data.
- **Tools**:
  - **Multer** and **Multer GridFS Storage**: File upload handling.
  - **Connect-Mongo**: Session storage in MongoDB.

---

## MVC Model Implementation

### Models

The **Models** define the database schema and interact with MongoDB:

1. **User Model** (`User.js`):
   - Fields: `username`, `email`, `password`, `role` (user/admin).
   - Purpose: Stores user authentication details.
2. **Photo Model** (`Photo.js`):
   - Fields: `title`, `description`, `category`, `image` (GridFS reference), `uploadedBy`.
   - Purpose: Manages uploaded photo data.
3. **Comment Model** (`Comment.js`):
   - Fields: `photoId`, `commentText`, `commentedBy`.
   - Purpose: Handles user comments on photos.
4. **Category Model** (`Category.js`):
   - Fields: `name`, `description`.
   - Purpose: Defines categories for organizing photos.

### Views

The **Views** are the EJS templates that render the UI for users and admins:

- `index.ejs`: Home page.
- `login.ejs` and `register.ejs`: Authentication pages.
- `profile.ejs`: User profile view with photos.
- `gallery.ejs`: Categorized photo gallery.
- `readerPost.ejs`: Single photo view with commenting functionality.
- `dashboard.ejs`: Admin dashboard.

### Controllers

The **Controllers** handle user actions and communication between Models and Views:

1. **Authentication Controller** (`auth.js`): Handles login, registration, and user sessions.
2. **Photo Controller** (`gallery.js`, `upload.ejs`): Manages photo uploads, deletions, and retrievals.
3. **Comment Controller** (`addComments.js`): Processes user comments on photos.
4. **Admin Controller**: Handles admin functionalities such as promoting users and data cleanup.

---

## Challenges

During the development of the Photo Gallery Application, we encountered several challenges:

1. **Design Framework Decisions**: Finalizing the application design framework required significant time and effort during group discussions to align on a unified approach.
2. **Authentication**: Implementing secure user authentication using **Passport.js** while maintaining session management was initially complex.
3. **Responsive Design**: Ensuring the design was mobile-friendly while keeping the UI visually appealing required significant adjustments to CSS.
4. **Database Cleanup**: Identifying and cleaning orphaned data entries using scripts like `cleanupOrphanedData.js` presented a learning curve.
5. **Implementing Comments Section**: Setting up the comments feature, including database relations and dynamic rendering, was technically challenging.
6. **File Uploads**: Integrating **GridFS** with **Multer** for file uploads required careful configuration and debugging.

---

## Future Work

If more time and resources were available, we would implement the following features:

1. **Search Functionality**: Allow users to search photos by keywords and uploader names.
2. **Photo Editing Tools**: Add basic editing options like cropping, rotating, and filtering photos.
3. **Keep Favorites**: Enable users to save favorite photos for a more interactive experience.
4. **Notification System**: Implement real-time notifications for comments, likes, and admin updates.
5. **Technologies to Explore**:
   - **React.js** or **Vue.js** for dynamic frontend rendering.
   - **AWS S3** for more scalable file storage.
   - **WebSockets** for real-time updates and notifications.

---

## Conclusion

This project provided hands-on experience with full-stack web development using **Node.js**, **Express.js**, and **MongoDB**. We learned essential web technologies and standards, such as:

- **Secure Authentication** using Passport.js and bcrypt.
- **File Management** with GridFS and Multer.
- **Database Management** with MongoDB and Mongoose.
- **Responsive Design** using modular CSS.

Future iterations of this course could include advanced frontend frameworks like **React.js** or backend performance optimization techniques.

---

## Resources

The following resources were instrumental in building this project:

1. [Multer GridFS Storage Documentation](https://www.npmjs.com/package/multer-gridfs-storage)
2. [Passport.js Guide](http://www.passportjs.org/)
3. [MongoDB GridFS](https://docs.mongodb.com/manual/core/gridfs/)
4. [Express.js Official Documentation](https://expressjs.com/)
5. [EJS Template Engine](https://ejs.co/)

---

### Application Goes Above and Beyond the Requirements
- **Additional Features Implemented**:
   1. **Commenting System**: Allows users to interact with photos through comments.
   2. **Photo Migration Tool**: Reorganize categories using `migratePhotoCategories.js`.
   3. **Admin Promotions**: Admins can promote standard users to admins using scripts.
   4. **Orphaned Data Cleanup**: Identify and remove unnecessary database entries.
   5. **Flash Notifications**: User-friendly notifications for successful or failed actions.
- Thoughtful group discussions ensured a robust design framework for the application.
