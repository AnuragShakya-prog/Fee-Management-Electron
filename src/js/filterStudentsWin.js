const {ipcRenderer} =require('electron');
const {getCurrentWindow} =require('electron').remote;

function sendFilterSignal(filterInfo){
    ipcRenderer.send("filter_students",filterInfo);
    
}


function collectFilterParam(){

    let filterData={};
    let filterInputs=Array.from(document.getElementsByClassName("filter-input"));

    for(let filterInput of filterInputs){

        if(filterInput.value.replace(/\s+/g,'')!=''){

            let filterValue=String(filterInput.value).trim();
            let filterKey=filterInput.id;
            filterData[filterKey]=filterValue;

        }

    }

    return filterData;

}