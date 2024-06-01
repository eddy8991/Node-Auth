const express = require('express');
const authRoutes = require('./routes/authRoutes');
const AppError = require('./utils/appError')
const cookieParser = require('cookie-parser');
const errorHandler = require('./controllers/errorController')
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// routes
app.all('*', (req,res,next) =>{
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
})
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);
app.use(errorHandler)
module.exports = app