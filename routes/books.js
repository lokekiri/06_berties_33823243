// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login'); 
    } else {
        next();
    }
};

router.get('/search', function(req, res, next){
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    // searching in the database
    res.send("You searched for: " + req.query.keyword)
});

router.get('/addbook', function(req, res, next) {
    res.render('addbook.ejs');
});

// Route to show books under £20
router.get('/bargainbooks', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT name, price FROM books WHERE price < 20"; // SQL query for bargain books
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("bargainbooks.ejs", { bargainBooks: result });
        }
    });
});

// Basic search (exact match)
router.get('/search-result', function (req, res, next) {
    const keyword = req.sanitize(req.query.keyword);   // SANITISE

    let sqlquery = "SELECT name, price FROM books WHERE name = ?"; 
    db.query(sqlquery, [keyword], (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("search-result.ejs", { 
                searchResults: result, 
                keyword: keyword 
            });
        }
    });
});

// Advanced search (partial match)
router.get('/search-result-advanced', function (req, res, next) {
    const keyword = req.sanitize(req.query.keyword);   // SANITISE

    let sqlquery = "SELECT name, price FROM books WHERE name LIKE ?";
    db.query(sqlquery, [`%${keyword}%`], (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("search-result.ejs", { 
                searchResults: result, 
                keyword: keyword 
            });
        }
    });
});


router.post('/bookadded', [
    check('name').notEmpty().withMessage('Book name cannot be empty.'),
    check('price').isFloat({ min: 0 }).withMessage('Price must be a number.')
],
 function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('addbook', { errors: errors.array() });
    }
    const cleanName = req.sanitize(req.body.name);  
    const price = req.body.price;                   
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send('This book is added to the database: <strong>' + req.body.name + '</strong> - £' + req.body.price);
        }
    });
});

// Updated /list route
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all books
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            // Render the list.ejs template and pass the result
            res.render("list.ejs", { availableBooks: result });
        }
    });
});

// Export the router object so index.js can access it
module.exports = router

