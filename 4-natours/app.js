const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // adds bunch of methods to app variable

// 1) GLOBAL MIDDLEWARE =>

// # Set Security http headers => https
app.use(helmet());

// # Development logging =>
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// # Limit requests from same API =>
const limiter = rateLimit({
  // 100 req from same id in 1 hour allowed
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// # Body parser , reading data from the into req.body =>
app.use(express.json({ limit: '10kb' })); // body parser using middleware => body ke data (frontend ke) req.body me pack karke de deta hai

// # Data Sanititzation against NoSQL query injections

app.use(mongoSanitize());

// # Data sanitization against XSS

app.use(xss());

// # Prevent parameter pollution

// removes duplicate parameters and uses the last of the parameter for filtering

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); 

// # Serving static files =>
app.use(express.static('4-natours/public')); // to use static files in routes , use this built in middleware , also sets given location as root location

// Creating our own MiddleWare =>

// app.use((req, res, next) => {
//   console.log('Hello from the middleWare 👋');
//   next();
// });
// Test middleware =>
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Routing =>

// app.get('/', (req, res) => { // THIS IS KNOWN AS ROUTE HANDLER
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint');
// });

// using jsend format => status and data{actual data}

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// Refractoring our code =>

app.use('/api/v1/tours', tourRouter); // we created a middleware basically and this is called Mounting the new router on a route
app.use('/api/v1/users', userRouter);

// added a middleware at the end for all types of requests, so that if routes above doesn't catch the url ,that means it doesn't yet exist.
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',d
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404); // agar next me kuch pass krdiya toh express will assume its an error and skip all other middlewares except global error handling middleware
});

app.use(globalErrorHandler);

module.exports = app;
