const axios = require('axios');
const teamScorePersist = require('./updateTeamScoreDB');
const _ = require('lodash');
  const calcCurrentGWScore  = async (GWNumber,teamID,pointsArray) => {
    let url = `https://fantasy.premierleague.com/api/entry/${teamID}/history/`;
    //console.log(`Fetching ${url}`)
    let currentGWPoints = 0;
    try{
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
    }
    catch(e){
      console.log(e);
    }
    
   
    //pointsArray.push(currentGWPoints);
    console.log('team id '+teamID+' points '+currentGWPoints);
    return currentGWPoints;
  }

async function fetchMissedTeamData(gw,league,team,client){
  console.log(team);
  team = team.split('_').join(' ');
  console.log(team);
  //team = _.replace(team, '_',' ');
  let teamIdArray =await getTeamData(league,team,client);
  console.log('teamIdArray'+teamIdArray);
  let pointsArray = [];
  let teamTotal = 0;
  let points = 0;
    for (let i in teamIdArray){
      console.log(teamIdArray[i]);
      points =await calcCurrentGWScore(gw,teamIdArray[i]);
      pointsArray.push(points);
    }
    console.log(pointsArray);
    pointsArray.sort();
    console.log(pointsArray);
    for(let j in pointsArray){
      if(parseInt(j)===0){
        teamTotal = pointsArray[j]*2;
      }else if(parseInt(j)<=5){
        teamTotal = teamTotal+pointsArray[j];
      }
    }
    console.log(teamTotal);
    teamScorePersist.persistGWPoints(league,gw,team,teamTotal,client);
}

let getTeamData = async function(league,team,client) {
  let result;
  let finalOut;
  //console.log('In Fetching  getGWFixtureDB');
  // Select all rows in the table
   await client.query('SELECT playerid FROM public.playerdata where teamname = $1 and league = $2 and isactive = $3',[team,league,'Y'])
  .then(data=> {
     result = data.rows;
     console.log(result);
     finalOut= result.map(element => element.playerid);
     console.log(finalOut);
     return finalOut;
  }).catch(err=>{
    console.log(err);
  });
  console.log('finalOut'+finalOut)
  return finalOut;
}

//  let teamArray =  ["2283436",
// "5549083",
// "1885408",
// "499096",
// "3489",
// "384110",
// "3018208"];

module.exports.fetchMissedTeamData = fetchMissedTeamData;