var express = require('express'),
    morgan  = require('morgan');
    app = express(),
    port = process.env.PORT || 8080,
    publicDir = require('path').join(__dirname, '/public');

app.use(morgan('dev'));

//serve public dir
app.use(express.static(publicDir));

//respond to other requests
app.use(function(req, res){
  var data = '<h1>404</h1>';
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.end(data);
})

app.listen(port);

console.log("listening on port: " + port);
