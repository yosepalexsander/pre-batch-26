const router = require('express').Router()

// render login page
router.get("/login", function(req, res) {
  res.render("auth/login", {title: "Login", isLogin: true})
})

// render register page
router.get("/register", function(req, res) {
  res.render("auth/register", {title: "Register", isLogin: true})
})

module.exports = router