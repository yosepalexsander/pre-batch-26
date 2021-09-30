const router = require("express").Router();

// import db connection
const dbConnection = require("../connection/db");
const uploadFile = require("../middlewares/uploadFile");
const pathFile = "http://localhost:5000/uploads/";

// render article add form page
router.get("/add", function (req, res) {
  res.render("article/form-add", {
    title: "Add Article",
    isLogin: req.session.isLogin,
  });
});

router.get("/edit/:id", function (req, res) {
  const { id } = req.params;

  if (!req.session.isLogin) {
    req.session.message = {
      type: "danger",
      message: "you must login first",
    };

    return res.redirect("/login");
  }
  const query = "SELECT * FROM tb_article WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    conn.query(query, [id], (err, results) => {
      if (err) throw err;

      if (req.session.user.id !== results[0].user_id) {
        req.session.message = {
          type: "danger",
          message: "you're not the owner of this article",
        };
        return res.redirect("/");
      }

      const article = {
        ...results[0],
        image: pathFile + results[0].image,
        content: results[0].content.replace(/(<br><br>)/g, "\r\n"),
      };

      req.session.message = {
        type: "success",
        message: "edit article successfully",
      };
      res.render("article/form-edit", {
        title: "Edit Article",
        isLogin: req.session.isLogin,
        article,
      });
    });

    conn.release();
  });
});
router.post("/", uploadFile("image"), function (req, res) {
  let { title, content } = req.body;
  let image = req.file.filename;
  const userId = req.session.user.id;

  content = content.replace(/(\r\n)/g, "<br>");

  const query = "INSERT INTO tb_article (title, content, image, user_id) VALUES (?,?,?,?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [title, content, image, userId], (err, result) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: "server error",
        };
        res.redirect("/article/add");
      } else {
        req.session.message = {
          type: "success",
          message: "add article successfully",
        };

        res.redirect(`/article/${result.insertId}`);
      }
    });
  });
});

router.post("/edit/:id", uploadFile("image"), function (req, res) {
  let { id, title, content, oldImage } = req.body;

  // replace trailing slash and new line with tag <br>
  content = content.replace(/(\r\n)/g, "<br>");

  let image = oldImage.replace(pathFile, "");

  if (req.file) {
    image = req.file.filename;
  }

  const query = "UPDATE tb_article SET title = ?, content= ?, image= ? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [title, content, image, id], (err, results) => {
      if (err) {
        console.log(err);
      }
      res.redirect(`/article/${id}`);
    });

    conn.release();
  });
});

// handle delete article
router.get("/delete/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM tb_article WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.message,
        };
        res.redirect("/");
      }

      req.session.message = {
        type: "success",
        message: "article successfully deleted",
      };
      res.redirect("/");
    });

    conn.release();
  });
});

// render detail article page
router.get("/:id", function (req, res) {
  const { id } = req.params;

  const query = "SELECT * FROM tb_article WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], (err, results) => {
      if (err) throw err;
      const article = {
        ...results[0],
        image: pathFile + results[0].image,
      };

      // initialize statement for article owner
      let isContentOwner = false;

      if (req.session.isLogin) {
        if (req.session.user.id == article.user_id) {
          isContentOwner = true;
        }
      }

      res.render("article/detail", {
        title: "Articles",
        isLogin: req.session.isLogin,
        article,
        isContentOwner,
      });
    });

    conn.release();
  });
});

module.exports = router;
