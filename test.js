
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
compareDates('10-27-2019','10-26-2019','10/28/2019 11:36:51')