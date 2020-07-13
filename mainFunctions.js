let fs=require('fs');


function createOrLogin(passfile){
    
    let passtext;
    let filename;

    
    if(fs.existsSync(passfile)){

        passtext=fs.readFileSync(passfile,'utf-8');
    
        if (passtext.replace(/\s+/g,'')==''){
            filename='createAccount.html'
        }else{
            filename='login.html'
        }

    }
    else{
        //do something when file is not present
        filename='createAccount.html';
    }

    return filename;

}


exports.createOrLogin=createOrLogin;
