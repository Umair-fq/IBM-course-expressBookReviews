const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const {username, password} = req.body;
  if(!username || !password) {
    res.status(403).json({message: "All fields are required"});
  }
  if (users.some(user => user.username === username)){
    return res.status(403).json({message: "Username already in use"});
  }

  const newUser = {
    username,
    password
  }

  users.push(newUser);
  res.status(200).json({message: "User added successfully"});

});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  //Write your code here
  try{
    const bookList = await new Promise((resolve) => {
      resolve(books)
    });
    return res.status(300).send(JSON.stringify(bookList))
  } catch {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  const getBookDetails = new Promise((resolve, reject) => {
    const isbn = parseInt(req.params.isbn);
    if(books[isbn]) {
      resolve(books[isbn]);
      // 
    } else {
      reject({ status: 403, error: "No such book found"})
      // res.status(403).json({error: "no such book found"})
    }
  })
  
  getBookDetails.
  then((bookDetails) => {
    res.status(200).json(bookDetails)
  })
  .catch((err) => {
    console.error(err);
    res.status(err.status || 500).json({error: err.message});
  })
  
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const getBookDetails = new Promise ((resolve, reject) => {
    const author = req.params.author;
    const result = Object.values(books).filter((book) => {
      return book.author === author;
    })
    if(result.length > 0) {
      // res.status(200).json(result)
      resolve(result)
    } else {
      reject({ status: 403, error: "No such book found"})
      // res.status(403).json({error: "no such book found"})
    }
  })

  getBookDetails
  .then((bookDetails) => {
    res.status(200).json(bookDetails)
  })
  .catch((err) => {
    console.error(err);
    res.status(err.status || 500).json({error: err.message});
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const getBookDetails = new Promise ((resolve, reject) => {
    const title = req.params.title;
  const result = Object.values(books).filter((book) => {
    return book.title === title;
  })

  if(result.length > 0) {
    resolve(result)
    // res.status(200).json(result)
  } else {
    reject({ status: 403, error: "No such book found"})
    // res.status(403).json({error: "no such book found"})
  }
  })

  getBookDetails
  .then((bookDetails) => {
    res.status(200).json(bookDetails)
  })
  .catch((err) => {
    console.error(err);
    res.status(err.status || 500).json({error: err.message});
  })
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);

  if (books[isbn]) {
    const bookReviews = books[isbn].reviews;

    if (Object.keys(bookReviews).length > 0) {
      return res.status(200).json(bookReviews);
    } else {
      return res.status(403).json({ message: "No reviews found for the book" });
    }
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.general = public_users;
