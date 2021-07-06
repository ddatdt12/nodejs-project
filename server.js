const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const colors = require('colors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

//load env vars
dotenv.config({ path: './config/config.env' });

const PORT = process.env.PORT || 5000;
//Route files
const bootcampsRoute = require('./routes/bootcamps');
const coursesRoute = require('./routes/courses');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const reviewsRoute = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

//connect database
connectDB();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

// Sanitize data, prevent hacking
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xssClean());


//Enable CORS
app.use(cors());

//Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
//  apply to all requests
app.use(limiter);

//Prevent http param polution
app.use(hpp());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/bootcamps', bootcampsRoute);
app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/reviews', reviewsRoute);

app.use(errorHandler);
const server = app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold,
    );
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err}`.red);
    //Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});
