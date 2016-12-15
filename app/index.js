const express = require('express');
const app = express();

// const dotenv = require('dotenv');
const morgan = require('morgan');
app.use(morgan('dev'));
// dotenv.load();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const passport = require('./auth.js');
const routes = require('./routes.js');

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routes);

const port = process.env.PORT || 5000;
app.listen(port);
console.log('Server running at http://localhost:' + port);
