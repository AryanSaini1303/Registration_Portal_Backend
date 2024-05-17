const express = require("express");
const passport = require("passport");
const session = require('express-session');
const { urlencoded } = require("body-parser");
const bodyParser = require("body-parser");
const port = 3000;
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));

/***********************************************************Google Login**********************************************/ 
// Initialize passport
require('./auth');

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Passport middleware should be initialized after express-session middleware
app.use(passport.initialize());
app.use(passport.session());

// Custom middleware
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}
app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
    })
);

app.get('/auth/protected', isLoggedIn, (req, res) => {
    let name = req.user.displayName;
    let email=req.user.email;
    // store this data in database (name and email)
    res.send(`Hello ${name} with email ${email}`);
});

app.get('/auth/google/failure', (req, res) => {
    res.send("failed");
});

app.use('/auth/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/');
})

/***********************************************************Google Login**********************************************/ 

app.get("/", (req, res) => {
    res.render('userDetailsForm.ejs');
});

// user details route
app.post('/userDetails',(req,res)=>{
    const userDetails=req.body;
    console.log(userDetails);
    res.sendStatus(200);
    // store this data in database and redirect to any route
})

// Team creation route with team name as input from form and team invitation code as output
app.post('/createTeam',(req,res)=>{
    const invitationCode=Math.floor(Math.random(10000)*99999);// Five digit numberic code
    const teamName=req.body.teamName;
    res.send(`Your team ${teamName} is created, Your team invitation code is: ${invitationCode}`);
    // Save this team in database
})

// Team joining with invitation code route
app.post('/joinTeam',(req,res)=>{
    const invitationCode=req.body.invitationCode;
    if(invitationCode.length==5){
        // check for this invitation code in database and add the current member in the team in database
        res.send(`Congratulations, You have joined the team!`);
    }
    else{
        res.send("Incorrect Invitation Code!");
    }
})
// Start server
app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});
