# LEGO Library
<img width="1918" alt="image" src="https://github.com/user-attachments/assets/2c9a844c-b4cd-4066-a409-a90c69ed721e">

## Introduction:
The web application is a LEGO Digital Library, created for LEGO enthusiasts to explore collections and share their favorite sets. Users can view detailed information about each LEGO set and filter sets by various themes. Once logged in, users can manage collections,adding, editing, and deleting LEGO sets.

Visit the website [here](https://lego-library.onrender.com). 

Note:  
The accessing could be slow or randomly down since the server is hosted under a free plan.
Incase the server is down, please check the [screenshots](https://github.com/Ryan-215/Lego_Library/blob/main/screenshots.md) document.

## Key Features
Tech Stacks: JavaScript, HTML, CSS, EJS, Node.js, Express.js, MongoDB, PostgreSQL  

### Dual Database Architecture:
The application leverages MongoDB for user data and PostgreSQL for LEGO set information. MongoDB, a NoSQL database, is ideal for storing user credentials, login history, and other related data thanks to its flexible schema, which easily accommodates changes and growth. PostgreSQL, a relational database, is used for LEGO set information due to its structured format and ability to handle complex queries. By integrating both databases, the application achieves efficient data management and scalability, with each system optimized for its specific role.

### Express.js Server with Session Management:
The application is built on Express.js, a framework for Node.js, providing a reliable server setup. Express handles HTTP requests, serves static assets (such as HTML, CSS, and client-side JavaScript), and manages user sessions to ensure continuous authentication across multiple requests. Session management is critical for preserving user login states as they navigate through different pages. By using server-side session handling, the application maintains both a secure and seamless user experience.

### Dynamic Web Pages with EJS Templates:
Dynamic content is generated using Embedded JavaScript(EJS) templates, allowing for server-side rendering based on real-time data and user interactions. EJS templates enable the application to dynamically display Lego sets, themes, and user history by incorporating data retrieved from MongoDB and PostgreSQL databases. This method improves performance by minimizing client-side processing and enables smooth incorporation of server-rendered content with front-end JavaScript, resulting in a highly responsive and flexible user interface.