// import package
const http = require("http")
const express = require("express")
const path = require("path")


const app = express()
const hbs = require("hbs")

const authRoute = require("./routes/auth")
const articleRoute = require("./routes/article")

// app.use(express.static('express'))
app.use("/static", express.static(path.join(__dirname, "public")))

app.use(express.urlencoded({ extended: false }))


// set views location to app 
app.set("views", path.join(__dirname, "views"))

// set template/view engine
app.set("view engine", "hbs")

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"))

let isLogin = true

// render index page
app.get("/", function(req, res) {
  res.render("index", {title: "Article", isLogin})
})

// mount auth route
app.use("/", authRoute)
// mount article route
app.use("/article", articleRoute)

const server = http.createServer(app)
const port = 5000;
server.listen(port, () => {
  console.log('server running on port: ', port)
})