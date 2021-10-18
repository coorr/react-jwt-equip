import axios from "axios";

const API_URL = 'http://localhost:8080/api/manage/';

class AiwacsService {

    createEquipment(equipment) {
        return axios.post(API_URL + "equipment" , equipment); 
    }
    getEquipment() {
        return axios.get(API_URL + "getEquipment" );
    }
    updateEquipmentByNo(equipId,equipment) {
        return axios.post(API_URL + "equipment/"+equipId, equipment);
    } 
    deleteEquipment(equipId) { 
      return axios.post(API_URL + "equipment/delete/"+equipId); 
    }
    onActiveEquipment(equipId) { 
      return axios.post(API_URL + "equipment/onActive/"+equipId ); 
    }
    offActiveEquipment(equipId) { 
      return axios.post(API_URL + "equipment/offActive/"+equipId ); 
    }
    typeFilterEquipment(equipType,equipCatagory) { 
      return axios.get(API_URL + "equipment/filterType/"+equipType+'/'+equipCatagory ); 
    }
    allTooltipHwUpdateEquipment(hwCpu,hwDisk,hwNic,hwSensor,hwid) {
      return axios.post(API_URL + "equipment/allTooltipHwUpdate/"+hwCpu+'/'+hwDisk+'/'+hwNic+'/'+hwSensor+'/'+hwid ); 
    }
    eachTooltipHwUpdateEquipment(hwCpu,hwDisk,hwNic,hwSensor,hwid) {
      return axios.post(API_URL + "equipment/eachTooltip/"+hwCpu+'/'+hwDisk+'/'+hwNic+'/'+hwSensor+'/'+hwid ); 
    }
    getTooltipByNo(hwid) {
      return axios.get(API_URL + "equipment/getTooltipByNo/"+hwid);
    }
    downloadExcel() {
      return axios.get(API_URL + "equipment/downloadExcel", {responseType:'arraybuffer'});
    }
    uploadExcel(data) {
      return axios.post(API_URL + "equipment/uploadExcel" , data ,); // { headers: { "Content-type": "multipart/form-data"}}
    }
}

export default new AiwacsService();