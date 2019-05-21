const express = require("express");
const passportRouter = express.Router();
// Require user model
const User = require("../models/user")
// Add bcrypt to encrypt passwords
const bcrypt = require("bcrypt")
const bcryptSalt = 15
// Add passport 
const passport = require("passport")

const ensureLogin = require("connect-ensure-login");


const isBoss = (req, res) => {
  console.log(req.user.rol, typeof req.user.rol)
  console.log(req.user.rol == "BOSS")
  return req.user.rol == "BOSS"
}

const isTa = (req, res) => {
  if (req.user.rol === "TA") return true
}

//sign up
passportRouter.get("/signup", (req, res, next) => res.render("../views/passport/signup"))

passportRouter.post("/signup", (req, res, next) => {
  console.log("******* Llegó")
  const { username, password } = req.body
  if (username === "" || password === "") {
    res.render("../views/passport/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
    .then(user => {
      if (user) {
        res.render("../views/passport/signup", { message: "The username already exists" });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass
      });

      newUser.save()
        .then(x => res.redirect("/"))
        .catch(err => res.render("/signup", { message: `Something went wrong: ${err}` }))
    })

})


//login
passportRouter.get("/login", (req, res, next) => {
  res.render("../views/passport/login", { "message": req.flash("error") })
})

passportRouter.post('/login', passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}))

const checkBoss = checkRoles('BOSS');
const checkDeveloper = checkRoles('DEVELOPER');
const checkTa = checkRoles('TA');

passportRouter.get("/private-page", (req, res) => {
  console.log(isBoss(req, res))
  res.render("passport/private", { user: req.user, boss: isBoss(req, res), ta: isTa(req, res) });
});
function checkRoles(rol) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.rol === rol) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}
passportRouter.post('/delete/:user_id', (req, res) => {
  User.findByIdAndRemove(req.params.user_id)
    .then(theUser => {
      res.redirect('/private-page')
    })
    .catch(error => console.log(error))
})


passportRouter.get('/edit/:user_id', (req, res) => {
  console.log("entrando a ruta de get")
  User.findOne({ _id: req.params.user_id })
    .then(user => res.render("edit", { user }))
    .catch(error => console.log(error))
})

passportRouter.post('/edit/:user_id', (req, res) => {
  const { username, password } = req.body
  User.update({ _id: req.params.user_id }, { $set: { username, password } })
    .then(() => res.redirect('/private-page'))
    .catch(error => console.log(error))

})


passportRouter.get("/logout", (req, res, next) => {
  req.logout()
  res.redirect("/")
})


module.exports = passportRouter;