# 📜 Blog API Backend

Welcome to the **Blog API Backend**! This project is a RESTful API for a blog platform that enables users to create, edit, and delete posts, interact with comments, and view blog content. The platform uses **role-based access control** to manage permissions for two user roles: **Viewer** and **Editor**.

## 🎭 Roles Overview

- **👤 Viewer**: Can view all blog posts, leave comments on posts, and manage personal notification preferences.
- **✍️ Editor**: Has all Viewer permissions and can additionally create, edit, and delete posts. Editors can also manage comments made by any user on their posts.

## ⚙️ Prerequisites

To set up and run the Blog API, make sure you have the following installed:

### 1. 🗄️ MongoDB
   - Install [MongoDB](https://www.mongodb.com/try/download/community) and [MongoDB Compass](https://www.mongodb.com/try/download/compass) for database management.
   - Create a new database named **`blogDb`** in MongoDB.

### 2. 🟩 Node.js
   - Ensure you have [Node.js](https://nodejs.org/en/) installed on your machine.

## 🚀 Getting Started

Follow these steps to install, configure, and run the project on your local environment:

### 2. 📥 Install Dependencies
   - In the project directory, run:
     ```bash
     npm install
     ```

### 3. 🔑 Configure Environment Variables
   - Create a `.env` file in the root directory of the project and add the following line:
     ```plaintext
     JWT_SECRET=RANDOM_STRING_HERE_FOR_ENCRYPTION
     ```
   - This `JWT_SECRET` is used for JWT (JSON Web Token) encryption to secure user authentication.

### 4. 🔧 Database Configuration
   - In the `dbConn.js` file, set the MongoDB connection string to your MongoDB setup.
   - If MongoDB is running locally, use the default connection string:
   - Example `dbConn.js` file:
     ```javascript
     // dbConn.js
         await mongoose.connect("mongodb://127.0.0.1:27017/blogDb", {
           // useNewUrlParser: true,
           // useUnifiedTopology: true,
         });

     ```

## ▶️ Running the Application

1. **▶️ Start the Server**:
   - In the project directory, start the server by running:
     ```bash
     node app.js
     ```
   - The server will be accessible on **[http://localhost:3000](http://localhost:3000)**.

2. **📖 View API Documentation**:
   - Access the API documentation at **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**. This Swagger-generated documentation provides details on all available endpoints, including request parameters, response formats, and descriptions of each route.

---

### 💡 Additional Tips:
- 💾 **Database Management**: Use **MongoDB Compass** to monitor and manage data in the `blogDb` database.
- 🔒 **Security Tip**: Ensure your `.env` file is **never shared publicly** and that `JWT_SECRET` is a complex, random string.

Enjoy exploring and extending this blogging platform! 😊
