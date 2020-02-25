#!/usr/bin/nodejs

// -------------- load packages -------------- //
// INITIALIZATION STUFF

var express = require('express');
//var got = require('got');
var app = express();
var hbs = require('hbs');

var path = require('path');
const { readdirSync, lstatSync } = require('fs');
const {join} = require('path');
var useragent = require('express-useragent');


// -------------- express initialization -------------- //
// PORT SETUP - NUMBER SPECIFIC TO THIS SYSTEM

app.set('port', process.env.PORT || 12470 );

app.use(express.static("static"));
app.use(useragent.express());

app.set('view engine', 'hbs');


var https = require('https');


// -------------- express 'get' handlers -------------- //
// These 'getters' are what fetch your pages

app.get('/', function(req, res){
    res.render("index");
});

app.get('/labs', function(req, res){
    
    var dirs = [{"dir" : "fun_page", "name" : "Fun Page"}, {"dir" : "weather", "name" : "Weather Forecaster"}];
    
    res.render("my_labs", {"labs" : dirs});
});

app.get('/fun_page', function(req, res){
    
    res.render("fun_page");
});


function getLocation(req, res, next){
    var lat = req.query.lat;
    var long = req.query.long;
    if(isNaN(lat) || isNaN(long) || lat === "" || long === "" || lat < -90 || lat > 90 || long < -180 || long > 180){
        res.locals.invalid = true;
        next();
        return;
    }
    lat = (Math.round(lat*10000.0))/10000.0;
    long = (Math.round(long*10000.0))/10000.0;
    var url = 'https://api.weather.gov/points/' + lat + ',' + long;
    var options = {'url' : url, headers : {'User-Agent': 'request'}};
    https.get(url, options, function(response) {

        response.on('data', function(d) {
    
            var obj = JSON.parse( d.toString() );
            if(obj.status == 404){
                res.locals.notUS = true;
                next();
            }else{
                console.log(obj);
                res.locals.city = obj.properties.relativeLocation.properties.city;
                res.locals.state = obj.properties.relativeLocation.properties.state;
                res.locals.url = obj.properties.forecastHourly;
                if(res.locals.url == null){
                    res.locals.noData = true;
                }
                next();
            }
        });


    }).on('error', function(e) {
        console.error(e);
    });
    
}

function getWeather(req, res, next){
    if(res.locals.invalid === true || res.locals.notUS === true || res.locals.noData === true){
        next();
        return;
    }
    var lat = req.query.lat;
    var long = req.query.long;
    var url = res.locals.url;
    var options = {'url' : url, headers : {'User-Agent': 'request'}};
    https.get(url, options, function(response) {
        var rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', function() {
            
            var obj = JSON.parse( rawData.toString() );
            var forecast = []
            for(i = 0; i < obj.properties.periods.length; i++){
                var temp = {};
                temp.day = obj.properties.periods[i].startTime.substring(5, 7) + '/' + obj.properties.periods[i].startTime.substring(8, 10); 
                temp.time = obj.properties.periods[i].startTime.substring(11,16);
                temp.temperature = obj.properties.periods[i].temperature;
                temp.unit = obj.properties.periods[i].temperatureUnit;
                temp.speed = obj.properties.periods[i].windSpeed;
                temp.direction = obj.properties.periods[i].windDirection;
                temp.shortForecast = obj.properties.periods[i].shortForecast;
                forecast.push(temp);
            }
            res.locals.forecast = forecast;
            next();
            
        });


    }).on('error', function(e) {
        console.error(e);
    });
    
}


app.get('/weather', function(req, res){
    res.render('weather');
});

app.get('/getWeather', [getLocation, getWeather], function(req, res){
    if(res.locals.invalid === true){
        res.render('forecast_error', {message: "Invalid location!"})
    }else if(res.locals.notUS === true){
        res.render('forecast_error', {message: "Location not in United States!"})
    }else if(res.locals.noData === true){
        res.render('forecast_error', {message: "No data for this location!"})
    }else{
        params = {'city' : res.locals.city, 'state' : res.locals.state, 'hours': res.locals.forecast};
        res.render('forecast', params);
    }
});

app.get('/schedule', function(req, res){
    res.render('schedule_generator');
});

app.get('/getSchedule', function(req, res){
    var gradreqs = [req.query.calc, req.query.social, req.query.lang, req.query.research, req.query.cs, req.query.econ];
    var gradstrs = ['take either AB or BC Calculus', 'take a fourth social studies credit', 'take three consecutive years of a foreign language',
    'take a Senior Research or Mentorship course', 'take a computer science course', 'take either EPF or AP Macro/Micro'];
    var periods = [req.query.period1, req.query.period2, req.query.period3, req.query.period4, req.query.period5, req.query.period6, req.query.period7]
    var firstName = req.query.firstname;
    var lastName = req.query.lastname;
    var grade = req.query.grade;
    if(firstName === '' || lastName === '' || grade === '' || firstName === undefined || lastName === undefined || grade === undefined){
        res.render('schedule_error', {'message' : 'Invalid Parameters!'});
        return;
    }
    var message = "Congratulations! You have completed all your graduation requirements!";
    var lefts = []
    for(i = 0; i < gradreqs.length; i++){
        if(gradreqs[i] === undefined){
            lefts.push(i);
        }else if(gradreqs[i] != "on"){
            res.render('schedule_error', {'message' : 'Invalid Parameters!'});
            return;
        }
    }
    if(lefts.length == 1){
        message = "Unfortunately, you still need to " + gradstrs[lefts[0]] + " to graduate."
    }
    if(lefts.length == 2){
        message = "Unfortunately, you still need to " + gradstrs[lefts[0]] + " and " + gradstrs[lefts[1]] + " to graduate."
    }
    if(lefts.length > 2){
        message = "Unfortunately, you still need to "
        for(i = 0; i < lefts.length; i++){
            if(i < lefts.length-2){
                message = message + gradstrs[lefts[i]] + ", "
            }else if(i == lefts.length-2){
                message = message + gradstrs[lefts[i]] + ", and "
            }else if(i == lefts.length-1){
                message = message + gradstrs[lefts[i]] + " to graduate."
            }
        }
    }
    var newperiods = []
    for(i = 0; i < periods.length; i++){
        if(periods[i] === '' || periods[i] === undefined){
            res.render('schedule_error', {'message' : 'Invalid Parameters!'});
            return;
        }
        newperiods.push({'index' : i+1, 'period' : periods[i]});
    }
    var params = {'firstname' : firstName, 'lastname' : lastName, 'grade' : grade,
    'periods' : newperiods, 'message' : message};
    res.render('get_schedule', params);
    
    
});





// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});