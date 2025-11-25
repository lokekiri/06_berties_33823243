// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login');   // if not logged in → redirect to login
    } else { 
        next();                    // logged in → continue
    }
};

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
});

// List all users (excluding passwords)
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT username, firstname, lastname, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("listusers.ejs", { users: result });
        }
    });
});

// Show login page
router.get('/login', function(req, res, next) {
    res.render("login.ejs");
});

// Show audit history
router.get('/audit', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM audit ORDER BY time DESC";

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("audit.ejs", { audit: result });
        }
    });
});

router.post('/registered', function(req, res, next) {

    const username = req.body.username;
    const plainPassword = req.body.password;

    let checkUser = "SELECT * FROM users WHERE username = ?";

    db.query(checkUser, [username], (err, results) => {
        if (err) { 
            return next(err); 
        }

        if (results.length > 0) {
            return res.send("Username already taken. Please choose another.");
        }

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return next(err);
            }

            let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)";

            let newrecord = [
                req.body.username,
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPassword
            ];

            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return next(err);
                } else {
                    let response = '';
                    response += 'Hello ' + req.body.first + ' ' + req.body.last + ', you are now registered!<br>';
                    response += 'We will send an email to ' + req.body.email + '<br><br>';
                    response += 'Your password is: ' + req.body.password + '<br>';
                    response += 'Your hashed password is: ' + hashedPassword + '<br><br>';
                    res.send(response);
                }
            });
        });
    });
});

// Handle login form
router.post('/loggedin', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    let sqlquery = "SELECT * FROM users WHERE username = ?";
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            next(err);
        }

        // If no user found
        if (result.length === 0) {

            // Log failed login
            let auditFail = "INSERT INTO audit (username, status) VALUES (?, 'fail')";
            db.query(auditFail, [username]);

            return res.send("Login failed: username not found.");
        }

        const storedHash = result[0].hashedPassword;

        bcrypt.compare(password, storedHash, function(err, match) {
            if (err) {
                next(err);
            }

            if (match === true) {

                // Log successful login
                let auditSuccess = "INSERT INTO audit (username, status) VALUES (?, 'success')";
                db.query(auditSuccess, [username]);
                req.session.userId = req.body.username;
                res.send("Login successful! Welcome " + username);
            } 
            else {

                // Log failed login
                let auditFail = "INSERT INTO audit (username, status) VALUES (?, 'fail')";
                db.query(auditFail, [username]);

                res.send("Login failed: incorrect password.");
            }
        });
    });
});

// Export the router object so index.js can access it
module.exports = router
