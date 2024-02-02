# LoraAI-Frontend
The LoraAI includes the frontend part of artificial intelligence.

This repository contains the frontend code for the LoraAI chatbot. The frontend is written in HTML, CSS, and JavaScript. Alongside the frontend, there is server-side code that provides the necessary server functionalities for the application.

#Server Features
The server is equipped with session-based authentication to implement automated logout functionality. It also includes an IDLE warning and drop feature to prevent unnecessary user logouts. Session time is continuously extended upon any interaction on the page. Data is stored in an SQLite3 database, including login credentials.

#Frontend Validation
The frontend includes several validation and verification functionalities. During registration, it checks if someone has already registered with the given email address. If so, it does not allow registration with the same email address. Additionally, password validation is implemented, specifying a minimum password complexity requirement. The password must contain at least 8 characters, including lowercase, uppercase, numeric, and special characters.

#Running the Server
The server code is written in Java, requiring Node.js for execution.

Note: Before use, make sure to replace the server URL data with custom data.

For further details, please refer to the code and comments within the repository.

Please ensure to review and customize the server URL data before usage.