# Reflections - A Photo Gallery Application

## Project Overview

The **Reflections - A Photo Gallery Application** is a dynamic and interactive platform where users can upload, manage, categorize, and interact with photos. It provides a secure environment for user authentication, admin capabilities, and enhanced user experience through responsive design and interactive features.

## Table of Contents

1. Introduction
2. Objective
3. Team Introduction
4. Problems Addressed
5. Additional Features
6. Project Functionality
   - Frontend
   - Backend
   - Admin Features
7. Technical Architecture
   - Libraries, Frameworks, and Tools
8. MVC Model Implementation
   - Models
   - Views
   - Controllers
9. Challenges
10. Future Work
11. Conclusion
12. Resources
13. Testing Instructions

---

## Introduction

Our team consists of the following members:

**The Reflections - A Photo Gallery Application** is a full-stack web platform designed to allow users to upload, manage, categorize, and interact with photos. The application ensures secure user authentication, role-based access control for admins, and interactive features like commenting on images. Built with modern technologies such as Node.js, Express.js, MongoDB, and EJS templates, the application offers a seamless and responsive user experience across devices.

---

## Objective

The primary goal of the project was to develop a dynamic and interactive photo gallery application where users can:

- **Upload and Manage Photos**: Users can upload images with details such as titles, categories, and descriptions.
- **User Authentication**: Implement user registration and login systems with role-based access controls.
- **Categorization**: Photos are organized into categories for better navigation and searchability.
- **Interactivity**: Users can interact with images by adding comments and exploring posts by others.

---

## Team Introduction

Our team collaborated closely to ensure the project was developed efficiently with a clear division of responsibilities:

- **Anusha Shiva Kumar**: Focused on the **frontend design**, creating intuitive and responsive user interfaces. She ensured the pages were user-friendly, visually appealing, and optimized for all devices.
- **Harshitha Batta**: Led the **backend development** by building the core server logic, APIs, and admin tools. Her contributions included implementing robust authentication and admin functionalities.
- **Neha Navarkar**: Served as the **database architect**, designing and managing the data models and database schema. She also contributed to backend development, ensuring data integrity and seamless integration.

Together, the team engaged in thoughtful discussions and collaborative problem-solving to deliver a feature-rich application.

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
7. **Like Functionality**: Users can like or unlike photos with a single click, featuring real-time updates to the like count. Non-logged-in users are shown a smooth popup notification for 3 seconds to sign in if they wish to like the photo.

---

## Project Functionality

### Frontend

The frontend focuses on providing a user-friendly and responsive interface using **EJS templates** and **CSS** for design:

- **Pages**:
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
  - `roles.js`: Middleware for verifying logged-in users.
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
  - **bcrypt**: Library for hashing passwords.
  - **jsonwebtoken**: Used for creating secure tokens.
  - **dotenv**: Loads environment variables.
- **Frontend**:
  - **EJS**: Template engine for rendering dynamic HTML pages.
  - **Vanilla CSS, Bootstap**: Styling for frontend pages.
  - **Flash.js**: Displays flash notifications for user feedback.
- **Database**:
  - **MongoDB**: NoSQL database for storing user, photo, and comment data.
- **Tools**:
  - **Multer** and **Multer GridFS Storage**: File upload handling.
  - **Connect-Mongo**: Session storage in MongoDB.

---

### 1. MVC Model Implementation

#### Models

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

#### Views

The **Views** are the EJS templates that render the UI for users and admins:

- `index.ejs`: Home page.
- `login.ejs` and `register.ejs`: Authentication pages.
- `profile.ejs`: User profile view with photos.
- `gallery.ejs`: Categorized photo gallery.
- `readerPost.ejs`: Single photo view with commenting functionality.
- `dashboard.ejs`: Admin dashboard.

#### Controllers

The **Controllers** handle user actions and communication between Models and Views:

1. **Authentication Controller** (`auth.js`): Handles login, registration, and user sessions (JWT Authentication).
2. **Photo Controller** (`gallery.js`, `upload.ejs`): Manages photo uploads, deletions, and retrievals.
3. **Comment Controller** (`addComments.js`): Processes user comments on photos.
4. **Like Controller** (`likes.js`): Manages photo likes functionality. Users can like or unlike a photo, with real-time updates to the like count. Ensures that only authenticated users can interact with the like feature.
5. **Admin Controller**: Handles admin functionalities such as promoting users and data cleanup.

---

### 2. Persistent Data Storage (MongoDB with Atlas)

- **MongoDB Atlas** is used as the database to store user, photo, and comment data.
- **GridFS** is implemented for persistent storage of uploaded photos.
- Data models are created using **Mongoose** to define schemas for `User`, `Photo`, `Comment`, and `Category`.
- Additional scripts like `cleanupOrphanedData.js` ensure data integrity by identifying and removing orphaned entries.

---

### 3. Log-in and Sign-up Functions

- **Secure Authentication** is implemented using JSON Web Tokens Authentication with username and password authentication.
- Passwords are hashed using **bcrypt** for security.
- **Session Management** is enabled with **express-session** and stored securely in MongoDB using **connect-mongo**.
- Users can register, log in, and log out with proper session handling.

---

### 4. Admin Capabilities for Advanced Functions

- Admin-specific functionalities include:
  - **Promoting Users**: Admins can promote standard users to admin roles using `promoToAdmin.js`.
  - **Data Management**: Admins can clean up orphaned data using `cleanupOrphanedData.js`.
  - **User and Photo Management**: Admins can delete unwanted users and photos from the **dashboard** (`dashboard.ejs`).
- Admin dashboard provides an overview of all photos and user accounts.

---

### 5. RESTful Web Service API with CRUD Operations

- **CRUD Operations** are implemented for key resources like Photos, Users, and Comments:
  - **Create**: Upload photos and add comments.
  - **Read**: View photos, comments, and profiles.
  - **Update**: Edit user profile and photo details.
  - **Delete**: Remove photos, comments, or users (admin-only functionality).
- Secure endpoints are protected with **authentication middleware** to manage access.

---

### 6. Application Properly Validates and Handles Errors

- **Validation**:
  - User input is validated during registration and login.
  - Proper error messages are displayed for invalid input.
- **Error Handling**:
  - **404 Page**: A custom `404.ejs` is displayed for invalid routes.
  - Restricted access for unauthorized users using `isAuthenticated.js` middleware.
  - Proper HTTP error codes are sent in case of failed operations.

---

### 7. Customized Interface for Different Users

- **Admin View**:
  - Admins access a dedicated dashboard (`dashboard.ejs`) to manage photos, users, and comments.
  - Advanced functionalities like promoting users, data cleanup, and content moderation.
- **Regular User View**:
  - Users can upload, view, and interact with photos.
  - Profile view allows managing uploaded photos and updating personal details.

---

### 8. Web Forms for Signup, Login, and Profile Editing

- **Forms Implemented**:
  - Signup Form: `register.ejs` with validation for username, email, and password.
  - Login Form: `login.ejs` with session handling.
  - Profile Edit: Editable fields for user details and photo management in `profile.ejs`.
- Form validation is implemented using server-side checks and feedback messages.

---

### 9. Enhanced Frontend Interactions with JavaScript

- **Interactivity** is implemented using **vanilla JavaScript**:
  - Comment Section: Users can interact with the photos by adding comments dynamically.
  - Like Section: Allows users to like or unlike photos. The like count updates in real-time, and the heart icon toggles between outlined and filled states. A 3 second popup notification appears to prompt users to log in if they attempt to like a photo while unauthenticated.
  - Modal Popups: Used for confirmation dialogs and profile editing.
  - Flash Notifications: Provide user feedback using the `flash.js` utility.
  - Dynamic photo preview on upload pages using JavaScript.

---

### 10. Polished Responsive and Consistent Design Using CSS

- **CSS** ensures a clean, responsive, and consistent UI:
  - Modular CSS files are created for `navbar.css`, `gallery.css`, `profile.css`, and `login.css`.
  - Responsive design ensures the application works seamlessly across devices (mobile, tablet, desktop).
  - Consistent styles for buttons, forms, galleries, and modals.

## Challenges

During the development of the Photo Gallery Application, we encountered several challenges:

1. **Design Framework Decisions**: Finalizing the application design framework required significant time and effort during group discussions to align on a unified approach.
2. **Authentication**: Implementing secure user authentication using **JWT Authetication** while maintaining session management was initially complex.
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

- **Secure Authentication** using JWT and bcrypt.
- **File Management** with GridFS and Multer.
- **Database Management** with MongoDB and Mongoose.
- **Responsive Design** using modular CSS.

Future iterations of this course could include advanced frontend frameworks like **React.js** or backend performance optimization techniques.

---

## Resources

The following resources were instrumental in building this project:

1. [Multer GridFS Storage Documentation](https://www.npmjs.com/package/multer-gridfs-storage)
2. [JWT Guide](https://jwt.io/)
3. [MongoDB GridFS](https://docs.mongodb.com/manual/core/gridfs/)
4. [Express.js Official Documentation](https://expressjs.com/)
5. [EJS Template Engine](https://ejs.co/)
6. [Pexels Website](https://www.pexels.com)

---

### Application Goes Above and Beyond the Requirements

- **Additional Features Implemented**:
  1.  **Commenting System**: Allows users to interact with photos through comments.
  2.  **Photo Migration Tool**: Reorganize categories using `migratePhotoCategories.js`.
  3.  **Admin Promotions**: Admins can promote standard users to admins using scripts.
  4.  **Orphaned Data Cleanup**: Identify and remove unnecessary database entries.
  5.  **Flash Notifications**: User-friendly notifications for successful or failed actions.
- Thoughtful group discussions ensured a robust design framework for the application.

### Submitted by

Anusha Shiva Kumar - [ans797@pitt.edu](mailto:ans797@pitt.edu)

Harshitha Batta - [hab213@pitt.edu](mailto:hab213@pitt.edu)

Neha Navarkar - [nen28@pitt.edu](mailto:nen28@pitt.edu)

To know more [About Us](https://reflections-site.glitch.me/about) click here!
