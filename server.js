require("dotenv").config();
const express = require("express");
const app = express();
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "newuser",
  password: "Khan@123",
  database: "mindtree",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database Connected!");
});

//TO CREATE USER
app.post("/create-user", (req, res) => {
  const body = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    dateOfBirth: req.body.dateOfBirth,
  };
  let sql = "insert into user set ?";
  let query = db.query(sql, body, (err, result) => {
    if (err) {
      console.log("UserName must be Unique");
      res.status("500").json({ message: "UserName must be Unique" });
    }
    console.log(result);
    res.send(result);
  });
});

// TO LOGIN
app.post("/auth", (req, res) => {
  let inputValue = req.body.input;
  let password = req.body.password;
  let sql = `select * from user where (username='${inputValue}' OR email='${inputValue}')  AND password='${password}'`;
  console.log(sql);
  let query = db.query(sql, (err, result) => {
    if (err) {
      console.log("Invalied Input");
      res.status("600").json({ message: "UserName must be Unique" });
    }
    const user = { username: result[0].username };
    console.log(user);
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    if (result.length <= 0) {
      res.status("200").json({ message: "User not found" });
    }
    res.send(result);
  });
});

// JWT TOKEN MIDDLEWARE
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
}

// TO CREATE BOOKS
app.post("/create-book", (req, res) => {
  let body = {
    title: req.body.title,
    authorName: req.body.authorName,
    isbn: req.body.isbn,
  };
  let sql = "insert into books set ?";
  let q = db.query(sql, body, (err, result) => {
    if (err) {
      console.log("Error");
      res.status("500").json({ message: "UserName must be Unique" });
    }
    console.log(result);
    res.send(result);
  });
});

// TO GET ALL BOOKS
app.get("/all-books", (req, res) => {
  let q = db.query("SELECT * FROM books", (err, result) => {
    if (err) {
      res.status("500").json({ message: "Error" });
    }
    console.log(result);
    res.send(result);
  });
});

// TO ADD FAV BOOK
app.post("/add-to-cart", (req, res) => {
  const body = {
    username: req.body.username,
    bookid: req.body.bookid,
  };
  let query = db.query("insert into fav set ? ", body, (err, result) => {
    if (err) {
      res.status("500").json({ message: err });
    }
    console.log(result);
    res.send(result);
  });
});
// TO GET USER FAV-BOOK
app.get("/my-fav-book", authenticateToken, (req, res) => {
  let q = db.query("select * from fav", (err, result) => {
    if (err) throw err;
    req.json(result.filter(item => item.username === req.user.username));
  });
});
app.listen(8000, () => console.log("server in on port 8000"));
