const axios = require('axios');
const _ = require('lodash');
const teamScorePersist = require('./updateTeamScoreDB');
const gwResult = require('./gameweekResultCalc');

let teamData = require('./teams.json');
const capSub = require('./excelParse');
const getGWAvg= require('./avgPoint');
const fixtureData = require('./fixtureParser');

let captainSubData;
let finalTeamList;
//let gw = 8;
//let league = 'FL'
// let gw;
// let league;

let avgPoints= 0;
let avgTeamPointArray = [];
let revisedTeamList = [];
let avgTempOutput = {

  };
  //const { Client } = require('pg');
  // const Pool = require('pg').Pool;
  // const client = new Pool({
  //   user: 'postgres',
  //   host: 'localhost',
  //   database: 'FPL',
  //   password: 'chandriya125',
  //   port: 5432,
  // });
  
  //client.connect();
  

const notPlayingTeams = ['Brighton and Hove Albion','Crystal Palace','Leicester City','Manchester United','Watford'];

let fetchPlayingTeamPoints = async function (gw,league,client,revisedTeams){
  console.log('*****Team Scores******');
  let teamName = "";
  let totalGWScore = 0;
  let teamPointArray = [];
  let tempOutput = {

  };
  //console.log('revisedTeams'+revisedTeams)
  console.log('131313');
 const promises= revisedTeams.map(async (team)=>{
      //console.log('Team Name'+team[0]);
    console.log('10101010');
     await fetchTeamTotal(gw,league,client,team[1],team[0]).then(gwScore=>{
       console.log('151515');
      //await fetchTeamTotal(team[1]).then(gwScore=>{
          // _.sum(gwScore);
           teamName= team[0];
           totalGWScore = _.sum(gwScore);
           //teamTotal[teamName] = totalGWScore;
           //console.log(`${teamName} -- ${totalGWScore}`);
           //console.log(teamTotal);
           //tempOutput[teamName] = totalGWScore+'';
           tempOutput={
             'team' : teamName,
             'points' : totalGWScore
           }
           teamPointArray.push(tempOutput);
           //console.log('tempOutput'+teamPointArray);
           return teamPointArray;
           
           //return `"team" : "${teamName}" ,"points" : "${totalGWScore}"`;
       }).catch(err=>{
         //console.log(err);
       });
       
      
      //return `team : ${teamName} ,points : ${totalGWScore}`;
       return teamPointArray;
  });
   Promise.all(promises).then(data=>{
     //console.log('data'+JSON.stringify(data))
     //console.log(tempOutput);
     //console.log(teamTotal);
    console.log('161616');
    
    var finalTeam = arrUnique(teamPointArray);
    //console.log('finalTeam'+JSON.stringify(finalTeam));
    //console.log(finalTeam[0]);
    for(i in finalTeam){
      teamScorePersist.persistGWPoints(league,gw,finalTeam[i].team,finalTeam[i].points,client);
     }
     //let jsonData = _.merge(finalTeam,avgTeamPointArray);
     
     for(i in avgTeamPointArray){
      teamScorePersist.persistGWPoints(league,gw,avgTeamPointArray[i].team,avgTeamPointArray[i].points,client);
     }

     return data;
   }).then(()=>{
     console.log('prcessing results of gameweek');
    gwResult.processGWResult(gw,league,client);
   });
}

let getCurrentGWTeamSnapshot = async function (league,gw,client){
  revisedTeamList = [];
  let teamObj;
  teamObj = _.cloneDeep(teamData);
  console.log('team json deep lone'+teamObj);
  console.log('9999');
  await capSub.gwCaptainSubDataFromDB(gw,league,client).then(data=>{
    
    captainSubData = data;
    console.log('captainSubData'+captainSubData)
  }).catch(err=>{
    //console.log(err);
  })
  //console.log('captainSubData'+JSON.parse(captainSubData))
teamObj.TeamList.map((team)=>{
   //console.log(team[0]);
for(let index in captainSubData){
   if(captainSubData[index][0]===team[0] && ! notPlayingTeams.includes(captainSubData[index][0])){
       team[1].push(captainSubData[index][1]+'');
       team[1] =removeElement(team[1],captainSubData[index][2]+'');
       team[1] =removeElement(team[1],captainSubData[index][3]+'');
       //console.log(`captain ${captainSubData[index][1]}`);
       //console.log(`sub1 ${captainSubData[index][2]}`);
       //console.log(`sub2 ${captainSubData[index][3]}`);
       //console.log(team[0]);
       //console.log(team[1]);
       revisedTeamList.push(team);
   }else{
       //console.log('not playing team'+captainSubData[index][0]);
   }
}
//revisedTeamList.push(team);
//console.log(team);
   //console.log(captainSubData.captainsubs[0][0]);
});
console.log('revisedTeamList'+revisedTeamList);
return revisedTeamList;
}

function removeElement(array, elem) {
var index = array.indexOf(elem);
if (index > -1) {
   array.splice(index, 1);
}
return array;
}
function arrUnique(arr) {
  var cleaned = [];
  arr.forEach(function(itm) {
      var unique = true;
      cleaned.forEach(function(itm2) {
          if (_.isEqual(itm, itm2)) unique = false;
      });
      if (unique)  cleaned.push(itm);
  });
  return cleaned;
}


let getFinalTeamPoints =async function (gw,league,client){
  avgTeamPointArray = [];
  console.log('3333');

  //await fixtureData.getFixturesDBMock(league,gw,client).then(async()=>{
  await getGWAvg.getAvgPtsURL(gw).then(data=>{
    avgPoints= data;
  }).catch(err=>{
    //console.log(err);
  });
//});//load fixtures data

console.log('avgPoints::'+avgPoints);

notPlayingTeams.map(voidTeam=>{
//teamTotal[voidTeam] = avgPoints*7+'';
avgTempOutput = {
  'team' : voidTeam,
  'points' : avgPoints*7
}
avgTeamPointArray.push(avgTempOutput);
//avgTeamPoints.push([voidTeam]);
//return `team : ${voidTeam} ,points : ${avgPoints*7}`
return avgTeamPointArray;
});
//console.log('avgTeamPoints'+avgTeamPoints);
//console.log(JSON.stringify(avgTeamPointArray));
finalTeamList = await getCurrentGWTeamSnapshot(league,gw,client);
await fetchPlayingTeamPoints(gw,league,client,finalTeamList);


}

const calcCurrentGWScore  = async (url,GWNumber,league,client,teamName,teamID) => {
  url
  //console.log(`Fetching ${url}`)
  let currentGWPoints = 0;
  
  const response = await axios(url);
  
  for(let i in response.data.current){
    if(response.data.current[i].event==GWNumber){
      if (GWNumber === 1) {
        currentGWPoints = response.data.current[i].total_points;
        //total = total + currentGWPoints;
      } else {
        currentGWPoints = response.data.current[i].total_points - response.data.current[i - 1].total_points
        //total = total + currentGWPoints;
      }
    }
      
  }
  teamScorePersist.persistGWPlayerPoints(league,GWNumber,teamName,currentGWPoints,teamID,client)
  return currentGWPoints;
}


const fetchTeamTotal = async (gw,league,client,teams, teamName) => {
  let teamPoint =0;
  console.log('141414');
  const requests = teams.map((teamID) => {
    const url = `https://fantasy.premierleague.com/api/entry/${teamID}/history/`
    return calcCurrentGWScore(url,gw,league,client,teamName,teamID) // Async function that fetches the points.
     .then((gwScore) => {
      return gwScore // Returns the user info.
      }).catch(err=>{
        console.log(`teamName::${teamName}-- teamID::${teamID}--${err}`);
      })
  })
  return Promise.all(requests) // Waiting for all the requests to get resolved.
}

async function processGWPoints(gw,league,client){
console.log('2222');
//To be commented
//capSub.loadCaptainSub(league,gw,client);
  await getFinalTeamPoints(gw,league,client).then( ()=>{
    console.log('finalllll');
  })
  
}

// processGWPoints(gw,league,client).then(()=>{
//   console.log('1111');
//   //(gwResult.processGWResult(gw,league,client));
// });

//fetchTeamTotal([2113808, 4339652]);
exports.processGWPoints = processGWPoints;
