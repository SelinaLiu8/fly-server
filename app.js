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
// app.get('/api', async (req, res) => {
//   req.socket.setTimeout(3600e3);
//   console.log('query', req.query);

//   // Set CORS headers
//   res.header("Access-Control-Allow-Origin", "*");
  
//   let response = { 'error': 'no valid query' };
  
//   console.log("request went through, here's the request: ", req);

//   if (req.query) { 
//     console.log(req.query.type); 
//   }

//   // Process various types of queries
//   if (req.query.type === 'new') {
//     res.json(['you did it']);
//     return; // End response here
//   } else if (req.query.type === 'search') {
//     response = await flyApi.getIdFromSearch(req.query.gene);
//     console.log('res', response);
//   } else if (req.query.type === 'isoform') {
//     response = await flyApi.getIsoFormSequence(req.query.isoform);
//   } else if (req.query.type === 'targetSearch') {
//     response = await puppet.searchForTargets(req.query.targetArea);
//   } else if (req.query.type === 'targetEfficiency') {
//     response = await puppet.checkTargetEfficiency(req.query.targets);
//   } else if (req.query.type === 'oligos') {
//     response = await puppet.getOligos(req.query.target);
//   } else if (req.query.type === 'primers') {
//     response = await puppet.getPrimers(JSON.parse(Buffer.from(req.query.primerSections, 'base64').toString('ascii')));
//   }

//   console.log('response: ', response);
//   res.json(response); // Send the response as JSON
//   const used = process.memoryUsage().heapUsed / 1024 / 1024;
//   console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
app.use('/css', express.static(path.join(__dirname, '/public/build/static/css')));
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
