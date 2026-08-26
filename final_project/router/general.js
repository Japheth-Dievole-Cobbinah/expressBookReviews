const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
        return res.status(400).json({ message: "User already exists!" });
    }
});

// Task 1 & 10: Get the book list (Modified for Async/Await)
public_users.get('/', async function (req, res) {
    // Using a Promise to wrap the data retrieval
    const getBooks = new Promise((resolve, reject) => {
        resolve(books);
    });

    try {
        const bookList = await getBooks;
        res.send(JSON.stringify(bookList, null, 4));
    } catch (err) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

// Task 2 & 11: Get book details based on ISBN (Modified for Promises)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    })
    .then((book) => res.send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Task 3 & 12: Get book details based on author (Modified for Async/Await)
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const filteredBooks = await new Promise((resolve) => {
            let results = Object.values(books).filter(b => b.author === author);
            resolve(results);
        });
        res.send(JSON.stringify(filteredBooks, null, 4));
    } catch (err) {
        res.status(500).json({ message: "Error filtering by author" });
    }
});

// Task 4 & 13: Get all books based on title (Modified for Async/Await)
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const filteredBooks = await new Promise((resolve) => {
            let results = Object.values(books).filter(b => b.title === title);
            resolve(results);
        });
        res.send(JSON.stringify(filteredBooks, null, 4));
    } catch (err) {
        res.status(500).json({ message: "Error filtering by title" });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;