const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    user
  `;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

// register user API
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectQueries = `
       SELECT * FROM user WHERE username = '${username}';
  `;

  const dbUser = await db.get(selectQueries);
  console.log(dbUser);
  if (dbUser === undefined) {
    const addTheUser = `
        INSERT INTO user (username,name,password,gender,location)
        values(
        '${username}',
         '${name}',
         '${hashedPassword}',
         '${gender}',
         '${location}'
        )
        `;
    await db.run(addTheUser);
    response.send("user register successfully !!");
  } else {
    response.status(400);
    response.send("user already exists !!");
  }
});

// login user API

app.post("/logins/", async (request, response) => {
  const { username, password } = request.body;
  console.log(username, password);
  const selectQueries = `
       SELECT * FROM user WHERE username = '${username}';
  `;

  const dbUser = await db.get(selectQueries);

  if (dbUser === undefined) {
    response.status(400);
    response.send("invalid user");
  } else {
    const passwordMatched = await bcrypt.compare(password, dbUser.password);
    if (passwordMatched === true) {
      response.send("login successfully");
    } else {
      response.send("invalid password");
    }
  }
});
