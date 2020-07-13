const fs=require('fs');
const mkdirs=require('mkdirs');
const path=require('path');

const {dialog,getCurrentWindow}=require('electron').remote;
const {BrowserWindow}=require('electron').remote;
const {ipcMain}=require('electron').remote;

const {ipcRenderer}=require('electron');

let currentWindow=getCurrentWindow();

let filelocation;

// Object constructors

function Student(name,fatherName,motherName,stdClass,mobileNo,studentId,dob){
    // This is studentObj constructor for creating students Obj
    this.name=name;
    this.fatherName=fatherName;
    this.motherName=motherName,
    this.mobileNo=mobileNo;
    this.studentId=studentId;
    this.dob=dob;
    this.stdClass=stdClass;
    this.save=function(){
        // This save function saves stdObj to file

        let studentsData=getStudentData("../assets/stddata");
        let studentList=studentsData['data'];
        let fatherName=this.fatherName.replace(/\s+/g,'');
        let name=this.name.replace(/\s+/g,'');
        if(studentList.length!=0){
            let last_obj=studentList[studentList.length-1];
            
            let lastObjNumberId=Number(last_obj.secret_id.split("_")[2]);
            this.secret_id=`${name}_${fatherName}_${lastObjNumberId+1}`;
        }else{
            this.secret_id=`${name}_${fatherName}_${0}`;
        }
        studentsData['data'].push(this);
        writeData(studentsData,filelocation);

    }
    this.update=function(secondObjId){
        let studentsData=getStudentData("../assets/stddata");
        let studentList=studentsData['data'];

        let newDataList=[]
        for(let student of studentList){
            if(student.secret_id!=secondObjId){
                newDataList.push(student);
            }
        
        }

        newDataList.push(this);

        studentsData['data']=newDataList;

        writeData(studentsData,filelocation);


        return true;
    }
}


function getStudentData(filefolder){
    // This fetches data from file and parse it if data could not be parsed then it will throw an error and 
    // app exists

    let filename='students_list.json';
    filefolder=path.resolve(__dirname,filefolder)
    filelocation=path.join(filefolder,filename)
    let studentData={}

    if(!fs.existsSync(filelocation)){
        // making directory if file not exists
        let resolved_folder_name=path.dirname(filelocation);
        console.log(resolved_folder_name);
        console.log(filelocation);
        mkdirs(path.join(resolved_folder_name));

        studentData={};
        
        createDefaultData(resolved_folder_name,filename);
    }

    // if file exists
    student_data_json=fs.readFileSync(filelocation,'utf-8');

    try{
        studentData=JSON.parse(student_data_json);
    }
    catch(err){
        
        dialog.showMessageBoxSync(currentWindow,{
            type:'error',
            message:'Something is wrong with students file',
            title:'Invalid data in students file',
        
        });

        ipcRenderer.send('quit');           
    }

    return studentData;

}

function setTotalStdValue(totalValue,totalStdId){
    
    let totalStdElem=document.getElementById(totalStdId);
    totalStdElem.innerHTML=String(totalValue);

}

function increaseTotalStdValue(totalStdId){
    let totalStdElem=document.getElementById(totalStdId);

    let totalStdValue=Number(totalStdElem.innerHTML)+1;

    totalStdElem.innerHTML=totalStdValue;

}


function showStudents(studentData){
    // This function shows data means add Students data in html

    let is_empty_data=Object.keys(studentData).length===0;

    if(!is_empty_data){

        let student_list=studentData['data'];
        let student_index=0;
        let tableBody=document.getElementById('students-tbody');

        let totalStudents=student_list.length;

        for(let studentObj of student_list){
            student_index+=1;

            let studentHtml=`<tr class="student-row" id='row-${studentObj.secret_id}'>
                                    <th scope="row"><input type="checkbox" class="StudentSelectBox"  onchange='onCheckboxChange(event);'/></th>
                                    <td id="student_id-col">${studentObj.studentId}</td>
                                    <td id='name-col' class='stdName-col' onclick="onNameClick(event);">${studentObj.name}</td>
                                    <td id='fatherName-col'>${studentObj.fatherName}</td>
                                    <td id='motherName-col'>${studentObj.motherName}</td>
                                    <td id='dob-col'>${studentObj.dob}</td>
                                    <td id='stdClass-col'>${studentObj.stdClass}</td>
                                    <td id='mobileNo-col'>${studentObj.mobileNo}</td>
                                    <td><a class='btn btn-primary' id=${studentObj.secret_id}  onclick='convertToInput(this.id);'>Edit</a></td>
                            </tr>`;

            
        
            tableBody.innerHTML+=studentHtml;

        }


        //Setting total students value
        setTotalStdValue(totalStudents,'total-std-value');
    }
}


function createDefaultData(filefolder,filename){
    // It creates default empty data if file does not exist

    let fullFilePath=path.resolve(filefolder,filename);

    try{
        let emptyData={
            data:[]
        }
    
        fs.writeFileSync(fullFilePath,JSON.stringify(emptyData));
    }
    catch(err){
            
        dialog.showMessageBoxSync(currentWindow,{
            type:'error',
            message:`${err}`,
            title:'Invalid data in students file',
        
        });

    }

}


function writeData(studentsData,filelocation){
    // This function takes students Data as obj and writes it in the file using filelocation path

    try{
        fs.writeFileSync(filelocation,JSON.stringify(studentsData));
    }
    catch(err){
            
        dialog.showMessageBoxSync(currentWindow,{
            type:'error',
            message:`${err}`,
            title:'Data writing error',
        
        });

    }
}



function getStdObj(secretId){
    // This functio will return stdObj which have id==secret_id

    let studentsData=getStudentData("../assets/stddata");

    let studentsList=studentsData['data'];

    for(let student of studentsList){

        if(student.secret_id==secretId){
            return student;
        }
    }

}

// Loads feeVoucherList.html
function goToFeeVoucherList(){
    currentWindow.loadFile("src/feeVoucherList.html");
}

// For filtering studentsData
function filterStudentsData(studentsData,stdInfo){
    
    // This function takes students Data to filter and stdInfo object to filter by information
    // like {name:'Anurag'} It will filter all students with name 'Anurag'

    let filteredStudents={
        data:[]
    };

    for(let student of studentsData['data']){
        
        let allInfoCorrect=true;

        for(let stdProp in stdInfo){
            let stdPropValue=String(student[stdProp]);

            if(stdPropValue.includes(stdInfo[stdProp])){
            }else{
                allInfoCorrect=false;
            }
        }
        if(allInfoCorrect){
            filteredStudents['data'].push(student);
        };

    
    }

    console.log(filteredStudents);
    showFilteredStudents(filteredStudents);

}

// This shows filterredStudents by taking filtered data
function showFilteredStudents(filteredData){
    
    let inputRowHtml=`<tr class="student-inputrow">
                    <th scope="row">#</th>
                    <td><input type="number" name="studentId" class='form-control std-input' id="stdId" onkeyup="changeFocusAndValidate(event);"></td>
                    <td><input type="text" name="name" id="stdName" class='form-control std-input' onkeyup="changeFocusAndValidate(event);"></td>
                    <td><input type="text" name="fatherName" class='form-control std-input' id="stdFatherName" onkeyup="changeFocusAndValidate(event);"></td>
                    <td><input type="text" name="motherName" class='form-control std-input' id="stdMotherName" onkeyup="changeFocusAndValidate(event);"></td>
                    <td><input type="date" name="dob" class='form-control std-input' id="stdDate" min="2000-01-01" max="2050-01-01" onkeyup="changeFocusAndValidate(event);"></td>
                    <td><input type="number" name="stdClass" class='form-control std-input' id="stdClass" onkeyup="changeFocusAndValidate(event);"></td>
                    <td><input type="number" name="mobileNo" class='form-control std-input' id="stdMobileNo" onkeyup="changeFocusAndValidate(event);"></td>
                    <!-- <td><a class="btn btn-primary">Edit</a></td> -->
                </tr>`

    let stdDataTable=document.getElementById("students-tbody");
    stdDataTable.innerHTML='';

    stdDataTable.innerHTML+=inputRowHtml;


    // Setting selectAllCheckbox to false
    let selectAllCheck=document.getElementById("selectAllCheckbox");

    selectAllCheck.checked=false;
    selectAllCheck.onchange(selectAllCheck);

    localStorage.setItem("selectedStdIds","[]");

    showStudents(filteredData);

}

// For creating filter window

let win;

function createFilterWindow(filterFileName){

        win=new BrowserWindow({
            width:600,
            height:380,
            frame:false,
            alwaysOnTop:true,
            webPreferences: {
                nodeIntegration:true,
            }
        });
        
        win.on("close",(event)=>{
            win=null;
        })

        win.loadFile(filterFileName);

        win.show();
}


// Getting students data to show
let stdData=getStudentData("../assets/stddata");

try{
    //Getting filterInfo from localstorage to filter students
    let filterInfoLoc=JSON.parse(localStorage.getItem("filterInfo"));
    filterStudentsData(stdData,filterInfoLoc);
}catch(err){
    //If filterInfo does not exists showStudents Normally
    console.log(err);
    showStudents(stdData);

}

function getAllPresentStudsId(){
    let allStudsRows=document.getElementsByClassName("student-row");
    let allStudsSecIds=[];


    for(let studRow of allStudsRows){
        let stdSecId=studRow.id.split("-")[1];

        allStudsSecIds.push(stdSecId);
    }

    return allStudsSecIds;
}


function addFee(fileFolder,filename,addFeeObj,allStudsId){
    // This function takes fileFolder ex- "../assets/stddata" filename ex:"feeValues.json"
    // The fees object to add ex:{"computer":400,"tuition":400,"total":800} and allStudsId to add fees  

    fileFolder=path.resolve(__dirname,fileFolder)

    let filePath=path.join(fileFolder,filename);

    let feeValues={};

    
    let feeValuesData=`{}`;
   
    try{
        feeValuesData=fs.readFileSync(filePath,'utf-8');

    }catch(err){
        console.log(err);
    }

    try{
        feeValues=JSON.parse(feeValuesData);
        
        for(let studId of allStudsId){

            if(feeValues[studId]==undefined){
                // If studId not present in the file then add the addFeeObj directly
                feeValues[studId]=JSON.stringify(addFeeObj);
                
            }else{
                // If it is there then get the current FeeValues of studId
                let stdFeeValues=JSON.parse(feeValues[studId]);
                // Will store added data in this
                let addedFee={};

                for(let std_fee_type in stdFeeValues){
                    for(let addFeeType in addFeeObj){
                        if(std_fee_type==addFeeType){
                            addedFee[addFeeType]=Number(stdFeeValues[std_fee_type])+Number(addFeeObj[addFeeType]);
                        }
                    }
                }

                // Filling gaps
                if(Object.keys(addFeeObj).length>Object.keys(addedFee).length){
                    
                    for(let feeType in addFeeObj){

                        if(addedFee[feeType]==undefined){
                            
                            addedFee[feeType]=Number(addFeeObj[feeType]);
                        }
                    }
                }

                feeValues[studId]=JSON.stringify(addedFee);

            }
        }

        try{
            // Writing updated feeValues
            fs.writeFileSync(filePath,JSON.stringify(feeValues));

        }catch(err){
            console.log(err);
            dialog.showMessageBoxSync(currentWindow,{
                type:'error',
                message:`Can't write into the file`,
                title:'Add fee error'
    
            });
        }

    }
    catch(err){
        console.log(err);
        dialog.showMessageBoxSync(currentWindow,{
            type:'error',
            message:'Invalid data stored in feeValues.json',
            title:'Add fee error'

        });
    }
}

let addWin;
function createStdAddFeeWin(addFeeWinFilename){
    addWin=new BrowserWindow({
        width:640,
        height:580,
        frame:false,
        webPreferences:{
            nodeIntegration:true
        }
    });

    addWin.on('close',(event)=>{
        addWin=null;
    })
    addWin.loadFile(addFeeWinFilename);

    addWin.show();
}


function selectAll(target){
        let allCheckboxes=Array.from($(".StudentSelectBox"));
        
        for(let checkbox of allCheckboxes){
            
            if(target.checked==false){
                checkbox.checked=false;
            }
            else{
                checkbox.checked=true;
            }
            checkbox.onchange(checkbox);
        }
    }


// listening for filter window signal
ipcMain.on("filter_students",(event,filterInfo)=>{

    filterStudentsData(stdData,filterInfo);

    localStorage.setItem("filterInfo",JSON.stringify(filterInfo));

});


ipcMain.on("stdAddFee",(event,stdAddFeeData)=>{

    // For selectively adding fees
    let selectedStudents=JSON.parse(localStorage.getItem("selectedStdIds"));
    let currentStudsId=getAllPresentStudsId();
    if(selectedStudents.length!=0){
        currentStudsId=selectedStudents;
    }
    console.log(stdAddFeeData);
    addFee("../assets/stddata","feeValues.json",stdAddFeeData,currentStudsId);
    

})