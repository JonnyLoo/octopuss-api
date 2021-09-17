const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./configs');
const app = express();

const router = require('./routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json(), cors());

if (process.env.NODE_ENV === 'local') {
  mongoose.connect(config.DB_URI_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true });
} else {
  mongoose.connect(config.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}
const db = mongoose.connection;

db.once('open', () => {
  console.log('connected to DB\n');
});

db.on('error', () => {
  console.error('error connecting to DB\n');
});

app.use('/octopuss', router);

const PORT = process.env.PORT || config.PORT;
app.listen(PORT, () => {
  console.log(`app listening on port ${config.PORT}`);
});
