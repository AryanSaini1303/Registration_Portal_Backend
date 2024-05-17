const express = require("express");
const passport = require("passport");
const session = require('express-session');
const bodyParser = require("body-parser");
const port = 3000;

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Initialize Passport and session
require('./auth');  // Assuming 'auth' contains Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Custom middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

// Google OAuth routes
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
    const { displayName, email } = req.user;
    // Store user data in the database
    res.send(`Hello ${displayName} with email ${email}`);
});

app.get('/auth/google/failure', (req, res) => {
    res.send("Google authentication failed");
});

app.use('/auth/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect('/');
    });
});

// Route to render user details form
app.get("/", (req, res) => {
    res.render('userDetailsForm.ejs');
});

// Route to handle user details submission
app.post('/userDetails', (req, res) => {
    const userDetails = req.body;
    console.log(userDetails);
    // Store user details in the database
    res.sendStatus(200);
});

// Route to create a team
app.post('/createTeam', (req, res) => {
    const invitationCode = Math.floor(Math.random() * 89999 + 10000); // Five-digit numeric code
    const teamName = req.body.teamName;
    // Save team in the database
    res.send(`Your team ${teamName} is created. Your team invitation code is: ${invitationCode}`);
});

// Route to join a team using an invitation code
app.post('/joinTeam', (req, res) => {
    const invitationCode = req.body.invitationCode;
    if (invitationCode.length === 5) {
        // Check invitation code in the database and add member to the team
        res.send(`Congratulations, you have joined the team!`);
    } else {
        res.send("Incorrect invitation code!");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});
