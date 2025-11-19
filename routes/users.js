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

// Export the router object so index.js can access it
module.exports = router
