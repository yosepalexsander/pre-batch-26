// import package
const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const hbs = require("hbs");

const authRoute = require("./routes/auth");
const articleRoute = require("./routes/article");

// import db connection
const dbConnection = require("./connection/db");

// app.use(express.static('express'))
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// html form parser
app.use(express.urlencoded({ extended: false }));

// set views location to app
app.set("views", path.join(__dirname, "views"));

// set template/view engine
app.set("view engine", "hbs");

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// user session
app.use(
  session({
    cookie: {
      maxAge: 7200,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue",
  })
);

// use flash for sending message
app.use(flash());

// setup flash message
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// render index page
app.get("/", function (req, res) {
  const query = "SELECT * FROM tb_article ORDER BY created_at DESC";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let articles = [];

      for (let result of results) {
        articles.push({
          ...result,
          image: "http://localhost:5000/uploads/" + result.image,
        });
      }

      res.render("index", { title: "Article", isLogin: req.session.isLogin, articles });
    });

    conn.release();
  });
});

// mount auth route
app.use("/", authRoute);
// mount article route
app.use("/article", articleRoute);

const server = http.createServer(app);
const port = 5000;
server.listen(port, () => {
  console.log("server running on port: ", port);
});
