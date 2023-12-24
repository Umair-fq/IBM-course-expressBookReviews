const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  const isUsername = users.filter((user) => user.username === username);
  if(isUsername){
    return true;
  }
  return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
if (!password || !username) { 
  return res.status(400).json({ error: "All fields are required" });
}
  for(let i=0; i < users.length; i++){
    if(users[i].username === username && users[i].password === password){
      return true;
  }
}
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const {username, password} = req.body;
  if(authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password,
    }, "access", {
      expiresIn: 3600
    });
    req.session.authorization = {accessToken, username}
    return res.status(200).json({message: "User successfully logged in", accessToken});
  } else {
    return res.status(200).send("Invalid credentials");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.r;
  const username = req.session.authorization.username

  if(!isValid(username)){
      return res.status(403).json({error: "Invalid username"});
  }

  const isBook = books[isbn];
  if(!isBook) {
      return res.status(403).json({error: "No such book"});
    } 
  
     // Log the existing reviews before adding the new one
    console.log("Existing reviews:", books.reviews);
    isBook.reviews[username] = review;

    console.log("Updated reviews:", books.reviews);

    return res.status(200).json({ message: "Review added successfully" });


});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username
  if (books[isbn]) {
    const book = books[isbn];
  if(book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  }  else {
    return res.status(404).json({ message: "No review found for the user" });
  }
}
  else {
  return res.status(404).json({ message: `ISBN ${isbn} not found` });
}
})


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
