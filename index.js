const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

const gradesRouter = require('./routes/grades.js');

app.use('/grade', gradesRouter);

app.listen(3000, () => {
  console.log('API Started!');
});
