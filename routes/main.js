// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request');

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

router.get('/weather', function (req, res, next) {

    let city = req.query.city || "London";
    let apiKey = ''; //its on VM not github dont want it 2 b stolen
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;


    request(url, function (err, response, body) {
        if (err) {
            return next(err);  
        }

        let weather;

        try {
            weather = JSON.parse(body);
        } catch (parseError) {
            return res.render("weather.ejs", {
                weather: null,
                error: "Unexpected API response."
            });
        }

        if (!weather || !weather.main) {
            return res.render("weather.ejs", {
                weather: null,
                error: "No data found. Check the city name."
            });
        }

        res.render("weather.ejs", {
            weather: weather,
            error: null
        });
    });
}); // weird on vm