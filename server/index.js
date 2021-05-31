// Importing Node modules and initializing Express
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  router = require('./router'),
  mongoose = require('mongoose'),
  socketEvents = require('./socketEvents'),
  config = require('./config/main'),
  passport    = require('passport');
 


// Tell the bodyparser middleware to accept more data
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Database Setup
function connectDB() {
  mongoose
    // .connect(process.env.DB_URI)
    .connect('mongodb://localhost:27017/donnyslist', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(
      () => {console.log("Database connected!");},
      (err) => {
        console.log("Database not ready!");
        setTimeout(function() {
          connectDB();
        }, 1000)
      })
}

connectDB();

// Start the server
let server;
if (process.env.NODE_ENV != config.test_env) {
  server = app.listen(config.port);

  console.log(`Your server is running on port ${config.port}.`);
} else{
  server = app.listen(config.test_port,'127.0.0.1');
}

const io = require('socket.io').listen(server);

socketEvents(io);

// Set static file location for production
// app.use(express.static(__dirname + '/public'));
app.use(express.static('public'))
app.set('view engine', 'ejs');

// Setting up basic middleware for all Express requests
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan

require('./config/passport')(passport);

// Enable CORS from client-side
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(passport.initialize());
app.use(passport.session());

// Import routes to be served
router(app);



// necessary for testing
module.exports = server;
