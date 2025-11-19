// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
});

// List all users (excluding passwords)
router.get('/list', function(req, res, next) {
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

router.post('/registered', function(req, res, next) {
    const plainPassword = req.body.password;

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
            next(err);
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
                next(err);
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

// Handle login form
router.post('/loggedin', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Get user's hashed password from the DB
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            next(err);
        }

        // If no user found
        if (result.length === 0) {
            return res.send("Login failed: username not found.");
        }

        const storedHash = result[0].hashedPassword;

        // 2. Compare password with the hash
        bcrypt.compare(password, storedHash, function(err, match) {
            if (err) {
                next(err);
            } 
            else if (match === true) {
                res.send("Login successful! Welcome " + username);
            }
            else {
                res.send("Login failed: incorrect password.");
            }
        });
    });
});

// Export the router object so index.js can access it
module.exports = router
