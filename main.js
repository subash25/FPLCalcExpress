var express = require('express');
var app = express();
const { Client } = require('pg');
const Pool = require('pg').Pool;
var processData = require('./fetchCurrentTeamScore');
let clearGWData =require('./deleteGWData');

const client = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'FPL',
    password: 'chandriya125',
    port: 5432,
  });
  //client.connect();
  
app.get('/loaddata/:league/:gameweek', function(req, res) {
    console.log(req.params);
    if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
        res.send('Enter valid URL in the format of loaddata/League/Gameweek');
    }
    processData.processGWPoints(parseInt(req.params.gameweek),req.params.league.toUpperCase(),client);
    res.send('Loading Gameweek Data!');
  });

  app.get('/deletedata/:league/:gameweek', function(req, res) {
    
        console.log(req.params);
        if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
            res.send('Enter valid URL in the format of loaddata/League/Gameweek');
        }
        clearGWData.deleteData(req.params.gameweek,req.params.league,client);
        res.send(`Deleted Gameweek ${req.params.gameweek} Data!`);
      });

    
  
  app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
  });