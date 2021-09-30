const dbConnection = require("../connection/db");
const router = require("express").Router();

// import bcrypt for password hashing
const bcrypt = require("bcrypt");

// render login page
router.get("/login", function (req, res) {
  res.render("auth/login", { title: "Login", isLogin: req.session.isLogin });
});

// render register page
router.get("/register", function (req, res) {
  res.render("auth/register", { title: "Register", isLogin: req.session.isLogin });
});

// logout
router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

// login handler
router.post("/login", function (req, res) {
  const { email, password } = req.body;
  const query = "SELECT id, email, password, name FROM tb_user WHERE email= ?";

  if (email == "" || password == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("/login");
    return;
  }

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [email], (err, results) => {
      if (err) throw err;

      const isMatch = bcrypt.compareSync(password, results[0].password);
      if (!isMatch) {
        req.session.message = {
          type: "danger",
          message: "email or password is incorrect",
        };
        return res.redirect("/login");
      } else {
        req.session.message = {
          type: "success",
          message: "login successfull",
        };

        req.session.isLogin = true;
        req.session.user = {
          id: results[0].id,
          email: results[0].email,
          name: results[0].name,
        };

        return res.redirect("/");
      }
    });

    conn.release();
  });
});

// handle register from client
router.post("/register", function (req, res) {
  const { email, password, name } = req.body;

  const query = "INSERT INTO tb_user(name, email, password) VALUES (?,?,?)";

  if (email == "" || password == "" || name == "") {
    req.session.message = {
      type: "danger",
      message: "Please fulfill input",
    };
    res.redirect("/register");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    // execute query
    conn.query(query, [name, email, hashedPassword], (err, results) => {
      if (err) throw err;

      req.session.message = {
        type: "success",
        message: "register successfull",
      };
      res.redirect("/register");
    });

    // release connection back to pool
    conn.release();
  });
});

module.exports = router;
