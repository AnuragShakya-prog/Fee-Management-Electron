const {ipcRenderer}=require("electron");
const {ipcMain}=require("electron").remote;

const {getCurrentWindow,BrowserWindow}=require("electron").remote;
const {dialog}=require("electron").remote;

const path=require("path");
const fs=require('fs');
const mkdirs=require('mkdirs');

let feeFilename="fee.json";
let feeLocation="../assets/stddata/";

let feeValuesFilename="feeValues.json";
let feeValuesLocation="../assets/stddata/";

let fullPath=path.resolve(__dirname,feeLocation)
fullPath=path.join(fullPath,feeFilename)

function getStdObj(){
    let std=JSON.parse(localStorage.getItem('stdObjToShow'));
    return std;
}


function getFeeData(feeLocation,fullPath,stdId){

    feeLocation=path.resolve(__dirname,feeLocation);

    let defaultData={

    }
    try{
        let feeData=JSON.parse(fs.readFileSync(fullPath));
        if(feeData.hasOwnProperty(stdId)){
            console.log(feeData[stdId]);
            console.log(feeData);
            return feeData[stdId];
            

        }

        return {};
    }
    catch(err){
        if(!fs.existsSync(feeLocation)){
            console.log("path not located");
            mkdirs(feeLocation);

            fs.writeFileSync(fullPath,JSON.stringify(defaultData));

        }else if(!fs.existsSync(fullPath)){
            fs.writeFileSync(fullPath,JSON.stringify(defaultData));
        }

        console.log(err);
    }

    return {};

}
// This function loads studentsList.html
function goToStudentList(){

    let currentWindow=getCurrentWindow();

    currentWindow.loadFile("./src/studentlist.html")


}

let allTotalPaidValue=0;

function showData(stdFeeData){
    let isEmptyFeeData=Object.keys(stdFeeData).length==0;

    allTotalPaidValue=0;

    if(isEmptyFeeData){
        return;
    }else{

        for(let feeId in stdFeeData){
            let feeObj=stdFeeData[feeId];

            let feeRowHtml=`<tr class='fee-row' id="${feeId}">
                                <th scope="row">${feeId}</th>
                                <td>${feeObj.feeDate}</td>
                                <td>${feeObj.totalPaid}</td>
                            </tr>`;

            allTotalPaidValue+=Number(feeObj.totalPaid);
            document.getElementById("feeListBody").innerHTML=feeRowHtml+document.getElementById("feeListBody").innerHTML;
        }

    }
    
    document.getElementById("totalPaid-Value").innerHTML=allTotalPaidValue;

}


function goToAddFee(){
    ipcRenderer.send("load_file","src/feeVoucher.html");

}

function getFeeById(feeId ,feeData){
    console.log(feeId);
    console.log(feeData);
   return feeData[feeId];
}

function loadFeeView(){
    ipcRenderer.send("load_file","src/feeView.html");
}

let win;

function createSetFeeWindow(){
    win=new BrowserWindow({
        width:610,
        height:520,
        frame:false,
        alwaysOnTop:true,
        webPreferences: {
            nodeIntegration:true,
        }
    });

    win.on('close',(event)=>{
        win=null;
    })

    win.loadFile("./src/setFee.html");

    win.show();
}

// function getRemainingFees(){
//     let stdObj=getStdObj();
// }

let currStdFees={};

function getFeeValue(folderPath,fileName){
    
    folderPath=path.resolve(__dirname,folderPath);
    let currStdObjId=getStdObj().secret_id;
    let fullPath=path.join(folderPath,fileName);

    try{
        
        let feeValuesData=JSON.parse(fs.readFileSync(fullPath,'utf-8'));

        
        if(feeValuesData[currStdObjId]){
            currStdFees= JSON.parse(feeValuesData[currStdObjId]);
            return currStdFees.totalFee;
        }else{

            return 0;
        }
   
    }
    catch(err){
        if(!fs.existsSync(fullPath)){
            // Setting fees to 0 becuase feeValues.json file does not exists
            currStdFees=0;
            return 0;
        }else{
            // Setting fees to 0 becuase file exists but something is wrong
            currStdFees=0;
            console.log(err);
            dialog.showMessageBoxSync({
                type:"error",
                message:'Something is wrong with fee values file'
            });
        }
    }
}

function capitalize(value){

    return value[0].toUpperCase()+value.slice(1);
}

function showAllFees(allFeesObj){

    if(allFeesObj!=0){
        let showFeesTbody=document.getElementById("allFees");
        
        showFeesTbody.innerHTML='';
        for(let feeType in allFeesObj){

            if(feeType=='totalFee'){
                continue;
            }
            let showFeeRowHtml=`<tr>
                                    <td>#</td>
                                    <td>${capitalize(feeType)}</td>
                                    <td>${allFeesObj[feeType]}</td>
                                    
                                 </tr>   `;

            showFeesTbody.innerHTML+=showFeeRowHtml;


        }
        let totalFeeRowHtml=`<tr>
                            <td>#</td>
                            <td><b>${capitalize("TotalFee")}</b></td>
                            <td><b>${allFeesObj["totalFee"]}</b></td>
                            
                            </tr>   `;

        showFeesTbody.innerHTML+=totalFeeRowHtml;


    }

}



let remainingFeeValue=getFeeValue(feeValuesLocation,feeValuesFilename);

document.getElementById("remainingFeeValue").innerHTML=remainingFeeValue;

let currentStd=getStdObj();

let stdId=currentStd['secret_id'];
// console.log(stdId);
let stdFeeData=getFeeData(feeLocation,fullPath,stdId);
showData(stdFeeData);

showAllFees(currStdFees);

ipcMain.on("setRemaining-fee",(event,value)=>{

    remainingFeeValue=getFeeValue(feeValuesLocation,feeValuesFilename);
    document.getElementById("remainingFeeValue").innerHTML=remainingFeeValue;

    showAllFees(currStdFees);

    // document.getElementById("remainingFeeValue").innerHTML=value; 

})