var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const apiRoutes = require('./routes/index');

var app = express();
app.use(express.json());

// cors
const cors = require('cors');
app.use(cors());

// API routes
app.use('/', apiRoutes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
// changed it to true
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve any other static files if needed
// app.use(express.static(path.join(__dirname, '/public/')));
// app.use(express.static(path.join(__dirname, '/public/build')));
// app.use(express.static(path.join(__dirname, '/public/build/static')));
// app.use('/', indexRouter);

//Public Directories
// app.use('/css', express.static(path.join(__dirname, '/public/build/static/css')));
app.use('/js', express.static(path.join(__dirname, '/public/build/static/js')));
app.use('/img', express.static(path.join(__dirname, '/public/build/img')));
app.use('/fly_templates', express.static(path.join(__dirname, '/public/build/fly_templates')));
app.use('/plasmid_folder', express.static(path.join(__dirname, '/public/build/plasmid_folder')));

// Catch-all handler for any requests that don't match
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/build', 'index.html'));
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
