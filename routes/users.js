// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/usr/364/users/login');   
    } else { 
        next();                   
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

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/usr/364/users/login');
        }
        res.send("You are now logged out. <a href='../'>Home</a>");
    });
});

router.post('/registered', 
[
    check('email').isEmail().withMessage('Email must be a valid email address.'),
    check('username')
        .isLength({ min: 5, max: 20 })
        .withMessage('Username must be between 5 and 20 characters.'),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.'),
    check('first')
        .notEmpty()
        .withMessage('First name cannot be empty.'),
    check('last')
        .notEmpty()
        .withMessage('Last name cannot be empty.')
],
function(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', { errors: errors.array() });
    }

    const username = req.sanitize(req.body.username);
    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const plainPassword = req.body.password; 

    let checkUser = "SELECT * FROM users WHERE username = ?";

    db.query(checkUser, [username], (err, results) => {
        if (err) return next(err);

        if (results.length > 0) {
            return res.send("Username already taken. Please choose another.");
        }

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) return next(err);

            let sqlquery =
                "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)";

            let newrecord = [username, first, last, email, hashedPassword];

            db.query(sqlquery, newrecord, (err, result) => {
                if (err) return next(err);

                let response = '';
                response += `Hello ${first} ${last}, you are now registered!<br>`;
                response += `We will send an email to ${email}<br><br>`;
                response += `Your password is: ${plainPassword}<br>`;
                response += `Your hashed password is: ${hashedPassword}<br><br>`;

                res.send(response);
            });
        });
    });
});

// Handle login form
router.post('/loggedin', [
    check('username').notEmpty().withMessage('Username cannot be empty.'),
    check('password').notEmpty().withMessage('Password cannot be empty.')
], 
function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', { errors: errors.array() });
    }

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
