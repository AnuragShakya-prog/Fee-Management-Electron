const path=require('path');
const fs=require('fs');

const {getCurrentWindow}=require('electron').remote;
const {ipcRenderer}=require('electron');

const mkdirs=require('mkdirs');
const  feeConfigFilename='fee_config.json';
let feeConfigLocation=path.resolve(__dirname,"../assets/stddata");

feeConfigPath=path.join(feeConfigLocation,feeConfigFilename);

const feeValuesFolder="../assets/stddata";
const feeValuesFilename="feeValues.json";

function readFeeConfig(feeConfigPath){

    let data= JSON.parse(fs.readFileSync(feeConfigPath,'utf-8'));

    return data;

}

function capitalize(value){

    return value[0].toUpperCase()+value.slice(1);
}

function addFeeFields(feeConfigData){
    let typesOfFee=feeConfigData.typesOfFee;

    let setFeeTable=document.getElementById("setFee-body");

    setFeeTable.innerHTML='';
    for(let typeOfFee of typesOfFee){
        let feeRowHtml=`<tr>
                            <td>#</td>
                            <td>${capitalize(typeOfFee)}</td>
                            <td><input type='number' name="${typeOfFee.toLowerCase()}" class="form-control setFee-input" /></td>
                        </tr>`;

        setFeeTable.innerHTML+=feeRowHtml;
    }
    
    let totalRowHtml=` <tr>
        <th scope='row'>#-Total</td>
        <td>Total</td>
        <td id="total-fee" >0</td>
    </tr>`;

    setFeeTable.innerHTML+=totalRowHtml;

}
function getTotal(){
    return Number(document.getElementById('total-fee').innerText);
}

function getFeeFromJson(folderPath,feeFilename){
    let feeData;
    let fullPath=path.resolve(folderPath,feeFilename);

    try{
        
        feeData=fs.readFileSync(fullPath,'utf-8');
        
        return JSON.parse(feeData);
    }catch(err){
        if(!fs.existsSync(folderPath)){
            mkdirs(folderPath);
            return {};
        }
        return {};
    }

}


function getStdObj(){
    let stdObjJSON=localStorage.getItem("stdObjToShow");      
    let stdObj=JSON.parse(stdObjJSON);

    return stdObj;
}


function getInpValues(){
    let allInps=Array.from(document.getElementsByClassName("setFee-input"));
   
    let valuesData={};
    for(let inp of allInps){
        if(inp.value==''){
            inp.value=0;
        }
        valuesData[inp.getAttribute('name')]=inp.value;
    }

    valuesData.totalFee=getTotal();
    return valuesData;

}

function writeFeeToJson(folderName,fileName,feeData){
    folderName=path.resolve(__dirname,folderName);
    let fullPath=path.join(folderName,fileName);
    let feeFileData=getFeeFromJson(folderName,fileName,feeData);
    
    let currentStudentId=getStdObj().secret_id;
    
   
    feeFileData[currentStudentId]=JSON.stringify(feeData);
    console.log(feeFileData);
    console.log(feeData);

    fs.writeFileSync(fullPath,JSON.stringify(feeFileData));
    ipcRenderer.send("setRemaining-fee",feeData.totalFee);

    getCurrentWindow().close();

}

let feeConfigData=readFeeConfig(feeConfigPath);
addFeeFields(feeConfigData);


document.getElementById("setFee-btn").addEventListener('click',(event)=>{

    let valuesData=getInpValues();

    writeFeeToJson(feeValuesFolder,feeValuesFilename,valuesData);

});