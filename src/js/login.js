const fs =require('fs');
const path=require('path');

const {dialog,BrowserWindow}=require('electron').remote;
const {remote,ipcRenderer,nativeImage}=require('electron');
// const {BrowserWindow}=require('electron');



let currentWindow=remote.getCurrentWindow();

function fetchAuthData(filelocation){
    // Auth file location
    filelocation=path.resolve(__dirname,filelocation);
    // Reading File
    if (fs.existsSync(filelocation)){
        authDataJSON=fs.readFileSync(filelocation,'utf-8');
        console.log(filelocation);

    }else{

        dialog.showMessageBoxSync(currentWindow,{
            type:'error',
            message:'Authentication file does not exists',
            title:'Authentication error',

        });

        ipcRenderer.send('quit','Auth file not found');
        console.log(filelocation);
        return;


    }

    try{
        // Parsing data
        let authData=JSON.parse(authDataJSON);
        
        // checking if username and password value is not undefined
        if((authData.username!=undefined)&&(authData.password!=undefined)){
            console.log(authData);
            return authData;
        }
        else{
            throw new Error('invalid data');
        }
    }
    catch(err){
        
        console.log(err);
        dialog.showMessageBoxSync(remote.getCurrentWindow(),{
            type:'error',
            message:'Invalid authentication data is stored in the file call the author of this software',
            title:'Authentication error',

        });
        ipcRenderer.send('quit','Auth data is not valid');
    }
}


let auth_data=fetchAuthData("../assets/auth/auth_data.json");


document.getElementById('login-btn').addEventListener('click',(event)=>{login(event,auth_data)});


function login(event,authData){

    let inputData=getFieldValues();

    if (inputData){

        let is_usernameCorrect=inputData.username==authData.username;
        let is_passwordCorrect=inputData.password==authData.password;
        
        if(is_usernameCorrect && is_passwordCorrect){
            // Loading another homepage file
            currentWindow.loadFile('src/studentlist.html');
        
        }else{
            
            dialog.showMessageBox(currentWindow,{
                type:'error',
                message:'Username or Password is not correct.Please try again',
                title:'Authentication failed',
            })


        }
    }


}


function getFieldValues(){
    let username=document.getElementById('username');
    let password=document.getElementById('password');

    let is_validUsername=checkInputField(username);
    let is_validPassword=checkInputField(password);

    if ((is_validUsername) && (is_validPassword)){
        let inputData={};
        inputData.username=(username.value).replace(/\s+/g,'');
        inputData.password=(password.value).replace(/\s+/g,'');

        return inputData;
    }

    return false;

}

function checkInputField(inputField){

    let inputValue=inputField.value;
    
    if (inputValue.replace(/\s+/g,'')==''){
        inputField.style.border="2px solid red";
        return false;
    }else{
        inputField.style.border='';
        return true;
    }

}