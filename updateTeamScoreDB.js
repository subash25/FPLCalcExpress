//const gwResult  = require('./gameweekResultCalc');
// const { Client } = require('pg')
// const client = new Client({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'FPL',
//   password: 'chandriya125',
//   port: 5432,
// });

// currentGW = 6;
// leagueName = 'FL';
let updateCount= 0;
let resultCount = 0;
let gwResultOut = false;
async function loadGWPointsData(league,gw,teamName,points,client){
    console.log('202020');
    
    console.log(updateCount);
   return client
    .query('INSERT INTO public.gwpoints(league, gameweek, team,points) VALUES($1, $2, $3,$4)',
    [league, gw,teamName,points])
   
}



function loadGWResultData(league,gw,team,won,lost,draw,awayTeamPoint,homeTeamPoint,gd,points,client){
    console.log('181818');
    client
    .query('INSERT INTO public.gwresultnew(league, gameweek, team,won,lost,draw,pf,pa,gd,points) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [league, gw,team,won,lost,draw,awayTeamPoint,homeTeamPoint,gd,points])
    .then(res => {
    //     resultCount=resultCount+1;
    //   console.log('resultCount'+resultCount);
      if(resultCount===20){
        //client.end();
        gwResultOut= true;
      }
      
    })
    .catch(e => {console.error(e.stack)
      client.end();});
      return gwResultOut;
}

function checknsertGWResultsData(league,gw,team,result,gd,client){
    client.query('select count(*) from public.gwresults where league =  $1 and gameweek =$2',[league,gw])
    .then(res=>{
        console.log('171717');
        //console.log(res.rows[0]);
        if(res.rows[0].count<1){
            loadGWResultData(league,gw,team,result,gd,client);
            //console.log('dataloaded');
        }else{
            //client.end();
        }
        
    }).catch(e => {console.error(e.stack)
        client.end();});
}

function loadGWPlayerPoints(league,gw,teamname,points,teamid,client){
    //console.log('252525');
    client
    .query('INSERT INTO public.playerpoints(league, gameweek, teamname,teamid,points) VALUES($1, $2, $3,$4,$5)',
    [league, gw,teamname,teamid,points])
    .then(res => {
      //console.log(`teamname ${teamname} teamid ${teamid} points ${points}`);
    })
    .catch(e => {
        console.error(e.stack)
      //client.end();
    });
}

let getGWResultDisplayFL = async function(client) {
  let result;
  //console.log('In Fetching  getGWFixtureDB');
  // Select all rows in the table
   await client.query(`select (homepts-awaypts) as homepd, hometeam, homepts,awaypts, awayteam,(awaypts-homepts) as awaypd from
   (select gu.gameweek, gu.hometeam, gu.HOMEPTS, gi.AWAYteam, gi.AWAYPTS
     from (select gameweek,hometeam,awayteam from fixturetable) gp
     full outer join
     (select Gameweek, TEAM as HOMEteam, pf HOMEPTS
                     from gwresultnew
                    where Gameweek || TEAM IN (select Gameweek || HOMEteam from fixturetable)) gu on gp.Gameweek = gu.Gameweek and gp.hometeam = gu.hometeam
     full outer join (select Gameweek, TEAM as AWAYteam, pf AWAYPTS
                                from gwresultnew
                               where Gameweek || TEAM IN (select Gameweek || AWAYteam from fixturetable)) gi on 
    gp.Gameweek = gi.Gameweek and gp.awayteam = gi.awayteam) final where final.gameweek = (select max(Gameweek) from gwresultnew)`)
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

let getTableDisplayFL = async function(client) {
  let result;
  //console.log('In Fetching  getGWFixtureDB');
  // Select all rows in the table
   await client.query(`select team, sum(won) won,sum(lost) lost,sum(draw) draw ,sum(pf) pf,sum(pa) pa,sum(gd) gd
   ,sum(points) points FROM public.gwresultnew group by team order by points desc, gd desc, pf desc,pa desc`)
  .then(data=> {
     result = data.rows;
  //console.log(result);
  //console.log('Team'+ JSON.stringify(result)); 
  //returnValue = result;
  //returnValue= data.rows[0].data;
  
  }).catch(err=>{
    console.log(err);
  });
  return result;
}

let updatePositions = async function(client){
  await client.query(`select sum(points) points, sum(gd) gd,sum(pf) pf, team from public.gwresultnew 
  group by team order by points, gd,pf`)
}

module.exports.getTableDisplayFL = getTableDisplayFL;
module.exports.getGWResultDisplayFL = getGWResultDisplayFL;
module.exports.persistGWPlayerPoints = loadGWPlayerPoints;
module.exports.persistGWPoints =loadGWPointsData;
module.exports.persistGWResult =loadGWResultData;