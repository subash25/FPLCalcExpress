//const Pool = require('pg').Pool;

// let gw = 7;
// let league = 'FL'

// const client = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'FPL',
//   password: 'chandriya125',
//   port: 5432,
// });

//client.connect();
let e;
let deleteData = function (gameweek,league,client){
    try{
        
        console.log('client'+client.toString());
        let queriesExecuted = 0;
        console.log('inside deleteData')
        // client
        // .query('delete from public.fixturetable where gameweek = $1 and league = $2',
        // [gameweek,league]).then(()=>{
        //     queriesExecuted = queriesExecuted+1;
        // });
        client.query('delete FROM public.gwpoints where gameweek = $1 and league = $2',
        [gameweek,league]).then(()=>{
            queriesExecuted = queriesExecuted+1;
        });
        client.query('delete FROM public.gwresults where gameweek = $1 and league = $2',
        [gameweek,league]).then(()=>{
            queriesExecuted = queriesExecuted+1;
        });
        client.query('delete FROM public.gwresultnew where gameweek = $1 and league = $2',
        [gameweek,league]).then(()=>{
            queriesExecuted = queriesExecuted+1;
        });
        client.query('delete FROM public.captainsubtable where gameweek = $1 and league = $2',
        [gameweek,league]).then(()=>{
            queriesExecuted = queriesExecuted+1;
        });
        client.query('delete FROM public.playerpoints where gameweek = $1 and league = $2',
        [gameweek,league]).then(()=>{
            queriesExecuted = queriesExecuted+1;
        });
        // .then(()=>{
        //     if(queriesExecuted===3){
        //         console.log('queriesExecuted'+queriesExecuted);
        //         //client.end();
        //     }
        // })
        console.log('exit deleteData')
    }
    catch(e){
        console.log(e);
    }finally{
        console.log('inside finally');
    }
}

 //deleteData(7,'FL',client);
// console.log('after delete data fn')
exports.deleteData = deleteData;
