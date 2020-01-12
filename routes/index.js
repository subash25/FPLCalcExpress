
const express = require('express');
const router = express.Router();
const fetchDB = require('../updateTeamScoreDB');
var processData = require('../fetchCurrentTeamScore');
let clearGWData =require('../deleteGWData');
let formFetch = require('../fetchForm');
let adhocTeam = require('../adhoc');

//const fixtureData = require('../fixtureParser');
  const { Client } = require('pg');
  const Pool = require('pg').Pool;
  // const client = new Pool({
  //   user: 'jcyxznjxhejybh',
  //   host: 'ec2-54-204-39-43.compute-1.amazonaws.com',
  //   database: 'd4rql2tkftd0bn',
  //   password: '06e6b13b8641b16bfab8fea682643d1e1c200e79df4ca92543116afbbc1c8733',
  //   port: 5432,
  //   ssl: true
  // });
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
// clearGWData.deleteData(req.params.gameweek,req.params.league,client);
// console.log('after delete');
// formFetch.initiateFetch(parseInt(input.gw),input.mindate,input.maxdate)
// console.log('fetch completed');

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
      formFetch.initiateFetch(req.params.gameweek,req.params.mindate,req.params.maxdate,client);
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

router.get('/fixtureLoad/:league/:gameweek',(req,res)=>{
  if(req.params.league===null || req.params.league === undefined || req.params.gameweek===null ||req.params.gameweek===undefined){
    res.send('Enter valid URL in the format of loaddata/League/Gameweek');
}
    fixtureData.getFixturesDB(req.params.league,req.params.gameweek,client)
    res.send(`Fetched Fixture data for Gameweek ${req.params.gameweek} !!`)
  
});

var numPool = [1, 2, 3, 4, 5, 6, 7 ,8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
var getNumber = function () {
  if (numPool.length == 0) {
      throw "All Teams Assigned";
  }
  var indexPos = Math.floor(numPool.length * Math.random());
  var drawn = numPool.splice(indexPos, 1);
  return drawn[0];
};
let map = new Map();
router.get('/assignGroup/:team',(req,res)=>{
  if(req.params.team===null || req.params.team === undefined){
    res.send('Enter valid URL in the format of assignGroup/team');
}
  if(map.get(req.params.team) !== undefined){
    res.send(`Assigned draw number for your team is ${map.get(req.params.team)}`);
  }else{
    //let randomNumber = Math.floor(Math.random() * 33) + 1 ;
    let randomNumber = getNumber();
    map.set(req.params.team,randomNumber);
    //genNum.push(randomNumber); 
    //fixtureData.getFixturesDB(req.params.league,req.params.gameweek,client)
    res.send(`Draw Number For Team  ${req.params.team} is ${randomNumber} !!`)
  }
    
  router.get('/viewDraw',(req,res)=>{
    if(map===null || map === undefined || map.size ===0){
      res.send('No data loaded!!!');
  }else{
    res.send(`${map.entries()}`);
  }
    
  });
  
});
module.exports = router;