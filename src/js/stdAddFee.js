const path=require('path');
const fs=require('fs');
const {ipcRenderer}=require('electron');
const {getCurrentWindow}=require('electron').remote;


const  feeConfigFilename='fee_config.json';
const feeConfigLocation=path.resolve(__dirname,"../assets/stddata");

const feeConfigPath=path.join(feeConfigLocation,feeConfigFilename);



function readFeeConfig(feeConfigPath){

    let data= JSON.parse(fs.readFileSync(feeConfigPath,'utf-8'));

    return data;

}


console.log('hi');

function addFeeInputsToHtml(totalFee_types){

    let addFeeInputTbody=document.getElementById("stdAddFeeInputTbody");
    for(let feeType of totalFee_types){
        
        let feeInputRowHtml=`<tr>
                                <td>#</td>
                                <td>${feeType[0].toUpperCase()+feeType.slice(1)}</td>
                                <td><input class="stdAddFeeInput form-control" type="number" name="${feeType.toLowerCase()}"/></td>
                             </tr>`

        addFeeInputTbody.innerHTML+=feeInputRowHtml;
    }
     // adding total row
     let totalRowHtml=` <tr>
                            <th scope='row'>#-Total</td>
                            <td>Total</td>
                            <td id="total-fee" >0</td>
                        </tr>`;

    addFeeInputTbody.innerHTML+=totalRowHtml;

}

function getAddfeeInputvalues(){
    let allInputs=Array.from(document.getElementsByClassName("stdAddFeeInput"));
    let inputsData={};

    for(let addInput of allInputs){
        let inputValue=addInput.value;
        let inputType=addInput.getAttribute('name');
        if(inputValue==''){
            inputValue=0;
        }
        inputValue=Number(inputValue);


        inputsData[inputType]=inputValue;

    }

    inputsData.totalFee=Number(document.getElementById("total-fee").innerHTML);
    
    return inputsData;

}


let totalFee_types=readFeeConfig(feeConfigPath).typesOfFee;

addFeeInputsToHtml(totalFee_types);

document.getElementById("stdAddFee-submitBtn").addEventListener('click',(event)=>{
    let stdAddFeeData=getAddfeeInputvalues();
    ipcRenderer.send("stdAddFee",stdAddFeeData);
   
    getCurrentWindow().close();
});