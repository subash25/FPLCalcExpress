var express     = require("express"),
fs              = require('fs'),
readline        = require('readline'),
{google}        = require('googleapis'),
request         = require('request'),
_               = require('underscore'),
app             = express();

//const Pool = require('pg').Pool;
// const client = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'FPL',
//   password: 'chandriya125',
//   port: 5432,
// });
let client;

let league = 'FL';
let gameweek;
let startDate;
let endDate;

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

app.get("/test", function(req, res){
    res.render('test')
  });

  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  const TOKEN_PATH = 'token.json';

  // Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);
//     // Authorize a client with credentials, then call the Google Sheets API.
//     authorize(JSON.parse(content), fetchData);
//   });
  
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

 async function fetchData(auth) {
  let finalFLData = [];
  let finalFFPLData = [];
  let tempArray = [];
  let uniqueFLData = [];
  let teamData = {

  };
  //let gameweek = 8;
  console.log('gameweek'+gameweek);
  let captain;
  let sub1;
  let sub2;
  let match = false;
  let playerData = await fetchPlayerData(league,gameweek, client);
  
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1mYaP3ZAkFVOSkAcLYXtX1QN_RXu2BZdgyXZjTLH3M3U',
    range: 'Form Responses 1!A2:HZ',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    let filteredData = [];
    if (rows.length) {
      //console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      for(let i in rows){
        if(rows[i][1]==='FL' && compareDates(startDate,endDate,rows[i][0])){
          filteredData.push(rows[i]);
        }
      }
      //console.log(filteredData);
      filteredData.map((row) => {
        var filtered = row.filter(function (el) {
          if (el != null || el != "")
            return el;
        });
        console.log('filtered '+filtered);
          if (filtered[2] === 'Bournemouth') {
            filtered[2] = 'AFC Bournemouth';
          } else if (filtered[2] === 'Tottenham') {
            filtered[2] = 'Tottenham Hotspur';
          }
        
        //console.log('filtered Revised'+filtered)
        for (i in playerData) {
          let playerInfo = playerData[i];
          if (playerInfo.league === filtered[1] && playerInfo.teamname === filtered[2]) {
            if (playerInfo.playername.toLowerCase() === filtered[4].toLowerCase()) {
              captain = playerInfo.playerid;
            } else if (playerInfo.playername.toLowerCase() === filtered[5].toLowerCase()) {
              sub1 = playerInfo.playerid;
            } else if (filtered[6] != undefined) {
              if (playerInfo.playername.toLowerCase() === filtered[6].toLowerCase()) {
                sub2 = playerInfo.playerid;
              }
            }else{
              sub2='';
            }
            //console.log(`playerInfo ${captain}  ${sub1} ${sub2}`);
          }
        }
        
        tempArray.push(filtered[2]);
        tempArray.push(captain);
        tempArray.push(sub1);
        tempArray.push(sub2);
        teamData={
          'team' : filtered[2],
          'data' : tempArray
        }
        if(filtered[1]==='FL'){
          finalFLData.push(teamData)
        }
        // else if(filtered[1]==='FFPL'){
        //   finalFFPLData.push(teamData);
        // }
        //reset
        tempArray=[];
        captain = '';
        sub1='';
        sub2='';
        //console.log(filtered[0]);
        //console.log(filtered);
        //console.log(row);
      });
      console.log('*******************FLFLFLFL**************************');
      //console.log(`finalData FL ${JSON.stringify(finalFLData)}`);
      //console.log(finalFLData[0]);

     uniqueFLData = fetchUniqueTeam(finalFLData);
     //uniqueFFPLData = fetchUniqueTeam(finalFFPLData);
     
     loadData('FL',gameweek,uniqueFLData,client);
     //loadData('FFPL',gameweek,uniqueFFPLData,client);
      console.log('*******************FL RESULTS**************************');
      console.log(`UniqueData FL ${JSON.stringify(uniqueFLData)}`);
      //console.log(uniqueFLData);
      console.log('********************FFPLFFPL***************************');
      //console.log(`UniqueData FFPL ${JSON.stringify(uniqueFFPLData)}`);
    } else {
      console.log('No data found.');
    }
  });
}

function fetchUniqueTeam(fetchTeam){
  let uniqueTeamData = [];
  fetchTeam.reverse();
      console.log(`finalData  ${JSON.stringify(fetchTeam)}`);
      fetchTeam = unique(fetchTeam,'team');
      
      for(k in fetchTeam){
        uniqueTeamData.push(fetchTeam[k].data); 
      }
      return uniqueTeamData;
}
function unique(array, propertyName) {
  return array.filter((e, i) => array.findIndex(a => a[propertyName] === e[propertyName]) === i);
}
async function fetchPlayerData(league,gameweek,client){
  let result;
  await client.query('SELECT league, teamname, playername,playerid FROM public.playerdata where league = $1',[league])
    .then(data=> {
       result = data.rows;
    //console.log(result);
    //console.log('Data'+ JSON.stringify(result)); 
    //returnValue = result;
    //returnValue= data.rows[0].data;
    
    }).catch(err=>{
      console.log(err);
    });
    return result;
}

function loadData(league,gameweek,data,con){

  //let excelOut = parseExcel();
  //console.log(`excelOut ${excelOut}`)
  con
  .query('INSERT INTO public.captainsubtable(league, gameweek, data) VALUES($1, $2, $3)',[league, gameweek,JSON.stringify(data)])
  .then(res => {
    console.log('inside loaddata')
    //con.end();
  })
  .catch(e => {
      console.error(e.stack)
      //con.end();
  });
}

function initiateFetch(gw,minDate,maxDate,clientParam){
  client = clientParam;
  gameweek=gw;
  startDate = minDate;
  endDate=maxDate;
  console.log('inside fetch'+gameweek);
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), fetchData);
  });
}

function compareDates(adhocMinDate,adhocMaxDate, sheetDate){
  adhocMinDate = adhocMinDate.split('-').join('/');
  sheetDate = sheetDate.substring(0,sheetDate.indexOf(' ')).trim();
if(adhocMaxDate===undefined){
  if(new Date(sheetDate).getTime()> new Date(adhocMinDate).getTime()){
      console.log('true');
      return true;
  }else{
      console.log('false');
      return false;
  }
}else{
  adhocMaxDate = adhocMaxDate.split('-').join('/');
  if(new Date(sheetDate).getTime()> new Date(adhocMinDate).getTime() && new Date(sheetDate).getTime()< new Date(adhocMaxDate).getTime()){
      console.log('true');
      return true;
  }else{
      console.log('false');
      return false;
}
  
}

}
exports.initiateFetch = initiateFetch;
//initiateFetch(9);