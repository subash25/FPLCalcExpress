
const express = require('express');
const path = require('path');
const routes = require('./routes');
let parser = require('body-parser');
const app = express();
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
// Set the default views directory to html folder
app.set('views', path.join(__dirname, 'html'));

// Set the folder for css & java scripts
app.use(express.static(path.join(__dirname,'css')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', routes);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log('Server is running at port:'+port);
});