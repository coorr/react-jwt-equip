import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class AiwacsService {

    createEquipment(equipment) {
        return axios.post(API_URL + "equipment" , equipment, { headers: authHeader() }); 
    }
    getEquipment() {
        return axios.get(API_URL + "getEquipment" ,{ headers: authHeader() });
    }
    updateEquipmentByNo(equipId,equipment) {
        return axios.post(API_URL + "equipment/"+equipId, equipment , { headers: authHeader() });
    } 
    deleteEquipment(equipId) { 
      return axios.post(API_URL + "equipment/delete/"+equipId , null,{ headers: authHeader() }); 
    }
    onActiveEquipment(equipId) { 
      return axios.post(API_URL + "equipment/onActive/"+equipId ,null,{ headers: authHeader() } ); 
    }
    offActiveEquipment(equipId) { 
      return axios.post(API_URL + "equipment/offActive/"+equipId , null,{ headers: authHeader() }); 
    }
    searchFilterEquipment(equipType,equipCatagory) { 
      return axios.get(API_URL + "equipment/filterType/"+equipType+'/'+equipCatagory , { headers: authHeader() }); 
    }
    allTooltipHwUpdateEquipment(hwCpu,hwDisk,hwNic,hwSensor,hwid) {
      return axios.post(API_URL + "equipment/allTooltipHwUpdate/"+hwCpu+'/'+hwDisk+'/'+hwNic+'/'+hwSensor+'/'+hwid , null,{ headers: authHeader() } ); 
    }
    eachTooltipHwUpdateEquipment(hwCpu,hwDisk,hwNic,hwSensor,hwid) {
      return axios.post(API_URL + "equipment/eachTooltip/"+hwCpu+'/'+hwDisk+'/'+hwNic+'/'+hwSensor+'/'+hwid ,null,{ headers: authHeader() } ); 
    }
    getTooltipByNo(hwid) {
      return axios.get(API_URL + "equipment/getTooltipByNo/"+hwid, { headers: authHeader() });
    }
    downloadExcel() {
      return axios.get(API_URL + "equipment/downloadExcel", {responseType:'arraybuffer' , headers: authHeader()});
    }
    uploadExcel(data) {
      return axios.post(API_URL + "equipment/uploadExcel" , data ,{ headers: authHeader() }); // { headers: { "Content-type": "multipart/form-data"}}
    }
}

export default new AiwacsService();