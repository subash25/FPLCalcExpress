//const { Client } = require('pg');
const teamScorePersist = require('./updateTeamScoreDB');
// const client = new Client({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'FPL',
//   password: 'chandriya125',
//   port: 5432,
// });
// client.connect();
let result;
let won,draw,lost,teampts;
let ptDif;
let totalDif;
let diffDivideByTen;
//const league = 'FL';
//const gw = 5;
let homeTeamPoint;
let awayTeamPoint;
let processGWResultOut = false;

let getGWFixtureDB = async function(gw,league,client) {
    let result
    console.log('In Fetching  captainSubData');
    // Select all rows in the table
     await client.query('SELECT league, gameweek, team, points FROM public.gwpoints where gameweek = $1 and league = $2',[gw,league])
    .then(data=> {
       result = data.rows;
    //console.log(result);
    //console.log('Team'+ JSON.stringify(result)); 
    //returnValue = result;
    //returnValue= data.rows[0].data;
    
    }).catch(err=>{
      //console.log(err);
    });
    return result;
  }

  let getGWPointsDB = async function(gw,league,client) {
    let result
    console.log('In Fetching  getGWPointsDB');
    // Select all rows in the table
     await client.query('SELECT league, gameweek, team, points FROM public.gwpoints where gameweek = $1 and league = $2',[gw,league])
    .then(data=> {
       result = data.rows;
    //console.log(result);
    //console.log('Team'+ JSON.stringify(result)); 
    //returnValue = result;
    //returnValue= data.rows[0].data;
    
    }).catch(err=>{
      //console.log(err);
    });
    return result;
  }
  let getGWFixture = async function(gw,league,client) {
    let result;
    //console.log('In Fetching  getGWFixtureDB');
    // Select all rows in the table
     await client.query('SELECT league, gameweek, hometeam, awayteam FROM public.fixturetable where gameweek = $1 and league = $2',[gw,league])
    .then(data=> {
       result = data.rows;
    //console.log(result);
    //console.log('Team'+ JSON.stringify(result)); 
    //returnValue = result;
    //returnValue= data.rows[0].data;
    
    }).catch(err=>{
      //console.log(err);
    });
    return result;
  }
  

  function calcResult(pointDifference){
    won=0;
    lost=0;
    draw=0;
    teampts=0;
    diffDivideByTen=pointDifference/10;
    if(diffDivideByTen<1 && diffDivideByTen>-1){
        result = 'D';
        ptDif = 0;
        draw=1;
        teampts=1;
    }else if(diffDivideByTen>1){
        result = 'W';
        ptDif = Math.trunc(diffDivideByTen);
        won=1;
        teampts=3;
    }else{
        result = 'L';
        ptDif = Math.trunc(diffDivideByTen);
        lost=1;
        teampts=0;
    }
  }

   function processGWResult(gw,league,client){
       console.log('212121');
    getGWFixture(gw,league,client).then(fixtureList=>{
        console.log(fixtureList);
       
        getGWPointsDB(gw,league,client).then(gwPoints=>{
          //console.log(fixtureList);
            console.log(gwPoints);
           
            for(i in fixtureList){
              for(j in gwPoints){
                  if(fixtureList[i].hometeam === gwPoints[j].team){
                      homeTeamPoint = gwPoints[j].points;
                  }
                  if(fixtureList[i].awayteam === gwPoints[j].team){
                      awayTeamPoint = gwPoints[j].points;
                  }
              }
              //console.log(`${fixtureList[i].hometeam} - ${homeTeamPoint} ${fixtureList[i].awayteam} - ${awayTeamPoint}` )
              totalDif =  homeTeamPoint - awayTeamPoint;
              calcResult(totalDif);
              //processGWResultOut =teamScorePersist.persistGWResult(league,gw,fixtureList[i].hometeam,result,ptDif,client);
              processGWResultOut =teamScorePersist.persistGWResult(league,gw,fixtureList[i].hometeam,won,lost,draw,homeTeamPoint,awayTeamPoint,ptDif,teampts,client);
              //console.log(`${fixtureList[i].hometeam} --- ${totalDif} --- ${result} --- ${ptDif}`);
              totalDif =  awayTeamPoint - homeTeamPoint;
              calcResult(totalDif);
              //processGWResultOut = teamScorePersist.persistGWResult(league,gw,fixtureList[i].awayteam,result,ptDif,client);
              processGWResultOut =teamScorePersist.persistGWResult(league,gw,fixtureList[i].awayteam,won,lost,draw,awayTeamPoint,homeTeamPoint,ptDif,teampts,client);
              console.log(`${fixtureList[i].awayteam} --- ${totalDif} --- ${result} --- ${ptDif}`);
              
            }
            
            //console.log(gwPoints.team);
            return processGWResultOut;
        })
        return processGWResultOut;
    })
    return processGWResultOut;
   
  }
  exports.processGWResult=processGWResult;