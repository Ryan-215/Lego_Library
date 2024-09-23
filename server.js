const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");
const express = require('express');
const path = require('path');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(
    clientSessions({
      cookieName: 'session',
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
      duration: 2 * 60 * 1000,
      activeDuration: 1000 * 60,
    })
  );

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
  }

// connect and sync with database
legoData.initialize().then(authData.initialize).then(() => {

    // GET "/"
    app.get('/', (req, res) => {
        res.render("home");
    })

    // GET "/about"
    app.get('/about', (req, res) => {
        res.render("about");
    })

    // GET "/lego/sets" with query applied on theme
    app.get('/lego/sets', (req, res) => {
        if (req.query.theme) {
            legoData.getSetsByTheme(req.query.theme)
            .then(data => {
                res.render("sets", {sets:data});
            })
            .catch(err => res.status(404).render("404", {message: err}));
        } else {
            legoData.getAllSets()
            .then(data => res.render("sets", {sets:data}))
            .catch(err => {
                res.status(404).render("404", {message:err});
            });
        }
    })

    // GET "/lego/sets/set_num"
    app.get('/lego/sets/:setNum', (req, res) => {
        legoData.getSetByNum(req.params.setNum).then(data => res.render('set', {set:data[0]}))
        .catch(err => res.status(404).render("404", {message:err}));
    })

    // GET "/lego/addSet"
    app.get('/lego/addSet', ensureLogin, (req,res) => {
        legoData.getAllThemes()
        .then(themeData => {
            res.render("addSet", { themes: themeData });
        })
        .catch(err => console.log(err));
    })

    // POST "/lego/addSet"
    app.post('/lego/addSet', ensureLogin, (req,res) => {
        legoData.addSet(req.body)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render("500", {message:err});
        });
    })

    // GET "/lego/editSet/:num"
    app.get('/lego/editSet/:num', ensureLogin, (req, res) => {
        legoData.getSetByNum(req.params.num)
        .then(setData => {
            legoData.getAllThemes()
            .then(themeData => {
                res.render("editSet", { themes: themeData, set: setData[0] });
            })
            .catch(err => { throw err })
        })
        .catch(err => res.status(404).render("404", { message: err }));
    })

    // POST "/lego/editSet
    app.post('/lego/editSet', ensureLogin, (req, res) => {
        legoData.editSet(req.body.set_num, req.body)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => res.render("500", { message: `Sorry, but we have encountered the following error: ${err}` }));
    })

    // GET "/lego/deleteSet/:num"
    app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
        legoData.deleteSet(req.params.num)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
    })

    // assignment 6
    // GET "/login"
    app.get('/login', (req, res) => { res.render("login", {errorMessage:""}); })

    // GET "register"
    app.get('/register', (req, res) => { res.render("register", {errorMessage:"", successMessage:""}); })

    // POST "/register"
    app.post('/register', (req, res) => {
        authData.registerUser(req.body)
        .then(() => {
            res.render("register", {errorMessage: "", successMessage: `User created`});
        })
        .catch(err => { 
            res.render("register", {errorMessage: err, successMessage: ""});
        });
    })    

    // POST "/login"
    app.post('/login', (req, res) => {
        req.body.userAgent = req.get('User-Agent');
        authData.checkUser(req.body)
        .then(user => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory,
            }
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render("login", {errorMessage: err});
        })  
    })

    // GET "/logout"
    app.get('/logout', (req, res) => {
        req.session.reset();
        res.redirect('/');
    })

    // GET "userHistory"
    app.get('/userHistory', ensureLogin, (req, res) => {
        res.render("userHistory");
    })

    // Show customized 404 Page
    app.use((req, res, next) => {
        res.status(404).render("404", {message: "Sorry, we're unable to find the page."});
    })

    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
}).catch(err => console.log(`Unable to start server: ${err}`));