
const express = require('express');
const router = express.Router();
const fetchDB = require('../updateTeamScoreDB');
var processData = require('../fetchCurrentTeamScore');
let clearGWData =require('../deleteGWData');
let formFetch = require('../fetchForm');
let adhocTeam = require('../adhoc');
  const { Client } = require('pg');
  const Pool = require('pg').Pool;
  
  const client = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'FPL',
    password: 'chandriya125',
    port: 5432,
  });
  
router.get('/', (req, res) => {
  console.log('Request for home recieved');
  res.render('index');
});

router.get('/adminload', (req, res) => {
  console.log('Request for loading data received');
  res.render('adminload');
});
router.post('/success', (req, res) => {
  var input = {
    gw : req.body.gameweek,
    mindate : req.body.mindate,
    league : req.body.league,
    isFetch : req.body.fetchform,
    adhocTeams : req.body.adhocTeam
    
}
console.log(input);
  console.log('Request for loading data received');
  res.render('success');
});

router.get('/table', (req, res) => {
  console.log('Request for table page recieved');
  fetchDB.getTableDisplayFL(client).then((tableData)=>{
    for(i in tableData){
      if(tableData[i].team==='Wolverhampton Wanderers')
        tableData[i].team= 'Wolves';
        if(tableData[i].team==='Brighton and Hove Albion')
        tableData[i].team= 'Brighton';
        if(tableData[i].team==='AFC Bournemouth')
        tableData[i].team= 'Bournemouth';
        if(tableData[i].team==='West Ham United')
        tableData[i].team= 'West Ham';
        if(tableData[i].team==='Tottenham Hotspur')
        tableData[i].team= 'Tottenham';
        if(tableData[i].team==='Manchester United')
        tableData[i].team= 'Man United';
        if(tableData[i].team==='Newcastle United')
        tableData[i].team= 'Newcastle';
        if(tableData[i].team==='Manchester City')
        tableData[i].team= 'Man City';
        if(tableData[i].team==='Sheffield United')
        tableData[i].team= 'Sheff United';
    }
    //console.log(gwResultData);
    res.render('table',{outputData:tableData});
   });
});

router.get('/result', (req, res) => {
   fetchDB.getGWResultDisplayFL(client).then((gwResultData)=>{
    //console.log(gwResultData);
    res.render('gwresult',{outputData:gwResultData});
   });
  console.log('Request for contact page recieved');
  
  //res.render('gwresult');
});

router.get('/loaddata/:league/:gameweek', function(req, res) {
  console.log(req.params);
  if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
      res.send('Enter valid URL in the format of loaddata/League/Gameweek');
  }
  processData.processGWPoints(parseInt(req.params.gameweek),req.params.league.toUpperCase(),client);
  res.send('Loading Gameweek Data!');
});

router.get('/deletedata/:league/:gameweek', function(req, res) {
  
      console.log(req.params);
      if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
          res.send('Enter valid URL in the format of loaddata/League/Gameweek');
      }
      clearGWData.deleteData(req.params.gameweek,req.params.league,client);
      res.send(`Deleted Gameweek ${req.params.gameweek} Data!`);
    });

router.get('/fetchForm/:league/:gameweek/:mindate/:maxdate?',function(req, res) {
  
  console.log(req.params);
  if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
      res.send('Enter valid URL in the format of loaddata/League/Gameweek');
  }
  formFetch.initiateFetch(req.params.gameweek,req.params.mindate,req.params.maxdate);
  res.send(`Fetched Gameweek ${req.params.gameweek} Data!`);
});

router.get('/adhoc/:league/:gameweek/:team',function(req, res) {
  
  console.log(req.params);
  if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
      res.send('Enter valid URL in the format of loaddata/League/Gameweek');
  }
  adhocTeam.fetchMissedTeamData(parseInt(req.params.gameweek),req.params.league,req.params.team,client);
  res.send(`Loaded ${req.params.team} data for Gameweek ${req.params.gameweek} !!`);
});
module.exports = router;