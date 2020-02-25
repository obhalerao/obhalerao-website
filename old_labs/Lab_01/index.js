#!/usr/bin/nodejs

// -------------- load packages -------------- //
// INITIALIZATION STUFF

var express = require('express');
var app = express();
var hbs = require('hbs');

var path = require('path');
var useragent = require('express-useragent');


// -------------- express initialization -------------- //
// PORT SETUP - NUMBER SPECIFIC TO THIS SYSTEM

app.set('port', process.env.PORT || 12470 );

function getCat(req, res){
    var fullpath = path.join(__dirname, 'cat.jpg')
    res.sendFile(fullpath);
}

app.use(useragent.express());

app.set('view engine', 'hbs');

var facts = [["One is the smallest natural number!",
    "One is the largest non-prime non-composite number!",
    "One is the number that comes after zero!",
    "One is the multiplicative identity!",
    "One is the first root of unity of the equation x^3 = 1!"],["Two is the smallest prime number!",
    "Two is the largest number n for which TREE(n) is computable!",
    "Two is one of two solutions to the equation x = x!",
    "Two is the smallest number to contain the letter 'w'!",
    "Two is smaller than three!"],["Three is the smallest odd prime number!",
    "Three is the number of solutions to a cubic equation (with multiplicity)!",
    "Three is larger than two!",
    "Three is the only solution to the equation x/2 = x!",
    "Three is the largest digit that appears in the look-and-say sequence!"],["Four is the smallest square of a prime number!",
    "Four is the number of solutions to the equation tan^2(x) = 1 on 0 < x < 2pi!",
    "Four is the second-smallest non-urban number!",
    "Four is the minimum number of colors needed to color a planar graph such that no connected sections have the same color!",
    "Four is the number of prime numbers less than 10!"],["Five is the largest prime number that is divisible by 10!",
    "Five is the median number of fingers on the human hand!",
    "Five is one of three solutions to the equation fib(n) = n, where fib(n) is the nth Fibonacci number!",
    "Five is the number of platonic solids!",
    "Five is the smallest degree of polynomial for which no analytic formula can be derived for its general solution!"],    ["Six is the smallest perfect number!",
    "Six is the smallest product of two different prime numbers!",
    "Six is the smallest solution to the inequality x! > x; x > 0!",
    "Six is the value of abc that satisfies the equation a+b+c = abc; a, b, c > 0!",
    "Six is larger than five!"], ["Seven 8 nine!",
    "Seven is the last digit of Graham's number!",
    "Seven is the smallest n for which an n-gon cannot be constructed using a compass and straighedge!",
    "Seven is the only dimension besides 3 for which a vector cross product can be defined!",
    "Seven is the number of Millennium Prize Problems!"],["Eight is the smallest cube of a prime number!",
    "Eight is the only Fibonacci number (besides 1) that is a perfect cube!",
    "Eight is the number of vertices on a cube!",
    "Eight is the first number which is neither prime not semiprime!",
    "Eight is the number of my favorite period at TJ!"],["Nine is the smallest square of an odd prime number!",
    "Nine is the digital root of all numbers divisible by nine!",
    "Nine is the number of sections on one face of a Rubik's cube!",
    "Nine is the highest single digit number in base 10!",
    "Nine is smaller than 10!"],["Ten is the base that humans most often use in math!",
    "Ten is the median number of fingers that humans have!",
    "Ten factorial seconds is equal to exactly six weeks!",
    "Ten is the sum of the first three prime numbers!",
    "Ten is the value of a US dime, in cents!"]];



// -------------- express 'get' handlers -------------- //
// These 'getters' are what fetch your pages

app.get('/', function(req, res){
    var fullpath = path.join(__dirname, 'index.html');
    console.log("user.");
    res.sendFile(fullpath);
});

app.get('/dog.jpg', function(req, res){
    var fullpath = path.join(__dirname, 'dog.jpg');
    res.sendFile(fullpath);
});

app.get('/cat.jpg', getCat);

app.get('/pet', function(req, res){
    var query = req.query.type;
    if(query == "cat"){
        var fullpath = path.join(__dirname, 'cat.jpg');
        res.sendFile(fullpath);
    }else if(query == "dog"){
        var fullpath = path.join(__dirname, 'dog.jpg');
        res.sendFile(fullpath);
    }else{
        res.send("undefined");
    }
});

app.get('/browser', function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var browser = req.useragent.browser;
    
    res.send("Your are using the " + browser + " browser, and your IP address is " + ip);
    
});

app.get('/:page', function(req, res){
    var query = req.query.num_facts;
    var number = req.params.page
    if(number <= 0 || number > 10){
        res.send("undefined")
    }else if(!isNaN(query) && query > 0 && query <= 5){
        res.render('old_labs/Lab_01/fact_index', {'number' : number, 'facts': facts[number-1].slice(0, query), 'num_facts' : query})
    }else if(query === undefined){
        res.render('old_labs/Lab_01/fact_index', {'number' : number, 'facts' : facts[number-1], 'num_facts' : 5});
    }else{
        res.send("undefined")
    }
});

app.get('/:page/json', function(req, res){
    var query = req.query.num_facts;
    var number = req.params.page
    if(number <= 0 || number > 10){
        res.send("undefined")
    }else if(!isNaN(query) && query > 0 && query <= 5){
        var info = {'page': number, 'num_facts': query, 'facts': facts[number-1].slice(0, query)};
        res.json(info);
    }else if(query === undefined){
        var info = {'page': number, 'num_facts': 5, 'facts': facts[number-1]};
        res.json(info);
    }else{
        res.send("undefined")
    }
});



// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});