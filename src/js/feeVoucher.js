const fs=require('fs');
const path=require("path");
const {getCurrentWindow,dialog}=require("electron").remote;
const {ipcRenderer}=require("electron");

const  feeConfigFilename='fee_config.json';
let feeConfigLocation="../assets/stddata";


let feeConfigPath=path.resolve(__dirname,feeConfigLocation);
feeConfigPath=path.join(feeConfigPath,feeConfigFilename);

let feeFilename="fee.json";
let feeLocation="../assets/stddata/";
let fullPath=path.resolve(__dirname,feeLocation)
fullPath=path.join(fullPath,feeFilename)

let currentWindow=getCurrentWindow();


function readFeeConfig(feeConfigPath){

    let data= JSON.parse(fs.readFileSync(feeConfigPath,'utf-8'));

    return data;

}
function changeStaticInfo(data){
    // Changing school Info
    let schoolHeading=$(".school-fee-heading")[0]; 
    let schoolAddress=$(".school-address")[0];
    schoolHeading.innerHTML=data.schoolName;
    schoolAddress.innerHTML=data.schoolAddress;

    // Changing fee inputs
    let feeContainer=$("#fee-body")[0];
    
    data.typesOfFee.forEach((fee)=>{
        let feeRowHtml=`<tr>
                            <th scope="row">1</th>
                            <td>${capitalize(fee)}</td>
                            <td><input type="number" name="${fee.toLowerCase()}-fee" id="${fee.toLowerCase()}-fee" class="form-control fee-input"></td>
                            
                        </tr>`

        feeContainer.innerHTML+=feeRowHtml;                    
    
    })
    // adding total row
    let totalRowHtml=` <tr>
                            <th scope='row'>#-Total</td>
                            <td>Total</td>
                            <td id="total-fee" >0</td>
                        </tr>`;

    feeContainer.innerHTML+=totalRowHtml;

}

function capitalize(value){
    return value[0].toUpperCase()+value.slice(1)
}

changeStaticInfo(readFeeConfig(feeConfigPath));


function goToFeeVoucherList(){

    let currentWindow=getCurrentWindow();

    currentWindow.loadFile("./src/feeVoucherList.html")


}

function getStdObj(){
    let stdObjJSON=localStorage.getItem("stdObjToShow");
            
            
    let stdObj=JSON.parse(stdObjJSON);

    return stdObj;
}

function getFeeData(filePath){

    
    let data=fs.readFileSync(filePath,"utf-8");
    
    try{
        data=JSON.parse(data);
    }
    catch(err){
        dialog.showMessageBoxSync(currentWindow,{
            type:'error',
            message:'Someone has changed fee file',
            title:'Invalid fee file',
        });

        ipcRenderer.send('quit');

    }

    return data;
    
}



function addFeeToJson(){
    // From to month handling
    let fromMonth=document.getElementById('fromMonth').value;
    let toMonth=document.getElementById('toMonth').value;
    let feeValuesFolder="../assets/stddata";
    let feeValuesFilename="feeValues.json";

    let feeValuesPath=path.resolve(__dirname,feeValuesFolder);
    feeValuesPath=path.join(feeValuesPath,feeValuesFilename);

    let mainStd=getStdObj();
    let mainStdId=mainStd.secret_id;

    let feeData={};
    
    feeData.fees=getFeeValues();
    feeData.feeDate=getCurrStrDate();
    feeData.totalPaid=getTotal();
    feeData.from_month=fromMonth;
    feeData.to_month=toMonth;

    let storedFeeData=getFeeData(fullPath);

    if(!storedFeeData.hasOwnProperty(mainStdId)){
        storedFeeData[mainStdId]={};
    }

    let feeId=getCurrStrDate();

    i=0;
    while(storedFeeData[mainStdId].hasOwnProperty(feeId)){
        feeId=feeId+" - "+String(i);
        i+=1;
    }
    
    storedFeeData[mainStdId][feeId]=feeData;

    writeFeeData(storedFeeData,fullPath);


    // Subtracting fees of student
    let feeValuesData={};
    let mainStdFee;    
    try{
        feeValuesData=JSON.parse(fs.readFileSync(feeValuesPath,'utf-8'));
        mainStdFee=feeValuesData[mainStdId];
        mainStdFee=JSON.parse(mainStdFee);
    }
    catch(err){
        console.log(err);
        if(!fs.existsSync(feeValuesPath)){
            feeValuesData[mainStdId]={"totalFee":0};
            mainStdFee={'totalFee':0};

        };
        if(mainStdFee==undefined){
            feeValuesData[mainStdId]={"totalFee":0};
            mainStdFee={'totalFee':0};
        }
    }

    let feeFields=feeData.fees;
    console.log(feeValuesData);
    let stdFees=mainStdFee;
    let remainingFee={};
    console.log(stdFees);
    console.log(feeFields);

    for(let feeType in feeFields){
        // feeType is = {"type":'computer',"paid":3}
        let fee_type=feeFields[feeType].type;
        for(let stdFeeType in stdFees){
            
            console.log(feeType);
            console.log(stdFeeType);
            if(fee_type==stdFeeType){
                remainingFee[fee_type]=Number(stdFees[stdFeeType])-Number(feeFields[feeType].paid);
            
            }
         }
    }

    console.log(remainingFee.length);
    console.log(feeFields.length);
    if(Object.keys(remainingFee).length<feeFields.length){
        for(let fieldNumber in feeFields){
            console.log('hello');
            let feeType=feeFields[fieldNumber].type;

            if(remainingFee[feeType]==undefined){
                remainingFee[feeType]=-Number(feeFields[fieldNumber].paid);
            }
        }
    }

    remainingFee.totalFee=Number(stdFees.totalFee)-Number(feeData.totalPaid);
    console.log(remainingFee);
    writeFeeValues(feeValuesFolder,feeValuesFilename,mainStdId,remainingFee);
    ipcRenderer.send("load_file","src/feeVoucherList.html");

}

function writeFeeValues(folderPath,filename,mainStdId,feeValuesObj){
    folderPath=path.resolve(__dirname,folderPath);
    let fullPath=path.join(folderPath,filename);
    let fileData={};
    try{
        fileData=fs.readFileSync(fullPath,'utf-8');
        fileData=JSON.parse(fileData);
    }catch(err){
        console.log(err);  
    }
    
    fileData[mainStdId]=JSON.stringify(feeValuesObj);

    
    fs.writeFileSync(fullPath,JSON.stringify(fileData));

    return true;

}

function getFeeValues(){
    let feeValues=[];

    let allInputs=document.getElementsByClassName("fee-input");

    for(let fee of allInputs){
        let feeObj={};
        console.log(fee);
        let feeType=fee.id.split("-")[0];
        feeObj.type=feeType;
        feeObj.paid=Number(fee.value);

        feeValues.push(feeObj);
    }

    return feeValues;
}

function getCurrStrDate(){
    let date=new Date();
    let day=date.getDate();
    let dayStr=String(day);
    let month=date.getMonth()+1;
    let monthStr=String(month);

    console.log(month);

    if(String(dayStr).length==1){
        dayStr="0"+dayStr;
    }
    
    if(String(monthStr).length==1){
        monthStr="0"+monthStr;
    }

    let dateStr=`${dayStr}/${monthStr}/${date.getFullYear()}`;

    return dateStr;
}

function getTotal(){
    return document.getElementById('total-fee').innerText;
}

function writeFeeData(feeData,filePath){
    fs.writeFileSync(filePath,JSON.stringify(feeData));
}
