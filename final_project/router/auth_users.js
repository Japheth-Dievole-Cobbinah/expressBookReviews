const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper: Check if username is already taken
const isValid = (username) => {
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length === 0; // True if valid (doesn't exist)
}

// Helper: Check if credentials match
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => user.username === username && user.password === password);
    return validusers.length > 0;
}

// Task 7: Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        // Sign JWT
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        
        // Save to session
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (books[isbn]) {
        // This will add a new review or update if the user already has one
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "The review for the book with ISBN " + isbn + " has been added/updated." });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review for the ISBN " + isbn + " posted by user " + username + " deleted." });
        } else {
            return res.status(404).json({ message: "Review not found for this user." });
        }
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;