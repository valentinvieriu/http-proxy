const path = require('path');
const express = require('express');
const proxy = require('./proxy');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('*', proxy);
app.listen(3000);
