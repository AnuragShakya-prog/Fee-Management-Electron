
const fs=require('fs');
let mkdirp = require('mkdirp');
let path=require('path');
const ipc=require('electron').ipcRenderer;

let mkdirs=require('mkdirs');
let createAccountBtn=document.getElementById("create-btn");

createAccountBtn.addEventListener('click',function(event){

    event.preventDefault();

    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;

    let authData={username:username,password:password};

    let errors=validateData(authData);

    console.log(errors);
    if ((errors.username==undefined) && (errors.password==undefined)){
        
        changeBorder(authData,'')
        storeAuthData(authData);
    }

    changeBorder(errors,'2px solid red');

})



function storeAuthData(data){
    
    
    let dataJson=JSON.stringify(data);
    
    let storePath="../assets/auth/auth_data.json";

    if(!fs.existsSync(path.resolve(__dirname,"../assets/auth"))){
        mkdirs(path.resolve(__dirname,"../assets/auth"));
    }

    let filepath=path.join(__dirname,storePath);
    console.log(storePath);

    console.log(filepath);
    fs.writeFile(filepath,dataJson,(err)=>{ 
        ipc.send('load_file','src/login.html');
        console.log('sending signal');
    });


}


function changeBorder(field_ids,value){
    for(let field_id in field_ids){
        console.log(field_id);
        document.getElementById(field_id).style.border=value;
    }
}

function validateData(data){

    let errors={}
    for(let fieldname in data){
        fieldValue=data[fieldname];

        
        if(fieldValue.replace(/\s+/g,'')==''){
            errors[fieldname]=fieldValue;
            // console.log(errors);
        }
    }

    return errors;
}
