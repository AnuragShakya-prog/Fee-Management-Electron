const {getCurrentWindow}=require("electron").remote;
const fs=require('fs');
const path=require("path");

const  feeConfigFilename='fee_config.json';
let feeConfigLocation="../assets/stddata";
feeConfigLocation=path.resolve(__dirname,feeConfigLocation);
let feeConfigPath=path.join(feeConfigLocation,feeConfigFilename);




function getFeeData(){
    let feeData=JSON.parse(localStorage.getItem("fee"));
    return feeData;
}

function capitalize(value){
    return value[0].toUpperCase()+value.slice(1)
}

function showFeeData(feeData){
    let feeTable=document.getElementById('fee-data');

    let feeList=feeData["fees"];
    console.log(feeList);


    feeList.forEach(fee => {
        console.log(fee);
        let feeHtml=`<tr>
                        <th scope="row">1</th>
                        <td>${capitalize(fee.type)}</td>
                        <td>${fee.paid}</td>
                        
                    </tr`;

        feeTable.innerHTML+=feeHtml;
        
    });

    let totalRowHtml=`<tr>
                        <th scope="row">#</th>
                        <td>Total</td>
                        <td>${feeData.totalPaid}</td>
                            
                      </tr`;

    feeTable.innerHTML+=totalRowHtml;

    // Changing name
    let stdNameElem=document.getElementById('stdName');
    let stdFatherNameElem=document.getElementById('stdFatherName');
 
    let stdObjJSON=localStorage.getItem("stdObjToShow");           
    let stdObj=JSON.parse(stdObjJSON);

    stdNameElem.innerText=stdObj.name;
    stdFatherNameElem.innerText=stdObj.fatherName;


    // Setting to from months
    toMonthElem=document.getElementById("to_month_value");
    fromMonthElem=document.getElementById("from_month_value");

    toMonthElem.innerHTML=capitalize(feeData['to_month']);
    fromMonthElem.innerHTML=capitalize(feeData['from_month']);

    // Setting today date
    let dateValueElem=$(".date-value")[0];

    let todayDate=new Date();
    let months=['January','February','March','April','May','June','July','August','September','October','November','December']
    
    let todaysDay=todayDate.getDate();
    let currentMonth=todayDate.getMonth();
    let currentYear=todayDate.getFullYear();

    let formattedDate=`${todaysDay},${months[currentMonth]} ${currentYear}`;

    dateValueElem.innerHTML=formattedDate;

    // setting fee date
    let feeDate=feeData.feeDate;
    // Breaking date by splitting from slash
    let breakedDate=feeDate.split('/');
    let [day,month,year]=breakedDate;
    month=months[Number(month-1)];
    day=Number(day);

    let feeFormattedDate=`${day},${month} ${year}`;

    let feeDateElem=document.getElementsByClassName("feeDate-value")[0];
    feeDateElem.innerHTML=feeFormattedDate;



}

function goToFeeList(){

    let currentWindow=getCurrentWindow();
    currentWindow.loadFile("./src/feeVoucherList.html")
}

function readFeeConfig(feeConfigPath){

    let data= JSON.parse(fs.readFileSync(feeConfigPath,'utf-8'));

    return data;
}


function changeStaticInfo(data){
    // Takes feeconfig data and set's it
    let schoolHeading=$(".school-fee-heading")[0]; 
    let schoolAddress=$(".school-address")[0];
    schoolHeading.innerHTML=data.schoolName;
    schoolAddress.innerHTML=data.schoolAddress;


    
    // Changin static mobile No

    let mobileNos=data["mobile_nos"];

    console.log(mobileNos);
    let mobNoDiv=document.getElementById("mobile-no-value-div");

    for(let mobileNo of mobileNos){
        mobNoDiv.innerHTML+=String(mobileNo)+"</br>";
    }
}


let currFeeData=getFeeData();
showFeeData(currFeeData);

let feeConfigData=readFeeConfig(feeConfigPath);

changeStaticInfo(feeConfigData);