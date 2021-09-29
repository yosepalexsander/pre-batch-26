const router = require('express').Router()

// render article add form page
router.get("/add", function (req, res) {
  res.render("article/form-add", {title: "Add Article", isLogin: true})
})

// render detail article page
router.get("/:id", function(req, res) {
  const { id } = req.params;

  res.render("article/detail", {title: 'Articles', isLogin: true, id})
})

module.exports = router