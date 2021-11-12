import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class AiwacsService {

  createEquipment(equipment,requestURL) {
      return axios.post(API_URL + "equipment" , equipment, { headers: { Authorization:  authHeader(), Referers:requestURL}}); 
  }
  getEquipment() {
      return axios.get(API_URL + "getEquipment" ,);
  }
  getEquipmentSnmp() {
    return axios.get(API_URL + "getEquipmentSnmp" ,);
  }
  updateEquipmentByNo(equipId,equipment,requestURL) {
      return axios.post(API_URL + "equipment/"+equipId, equipment , { headers: { Authorization:  authHeader(), Referers:requestURL}});
  } 
  deleteEquipment(equipId,requestURL) { 
    return axios.post(API_URL + "equipment/delete/"+equipId , null,{ headers: { Authorization:  authHeader(), Referers:requestURL}}); 
  }
  onActiveEquipment(equipId,requestURL) { 
    return axios.post(API_URL + "equipment/onActive/"+equipId ,null,{ headers: { Authorization:  authHeader(), Referers:requestURL}} ); 
  }
  offActiveEquipment(equipId,requestURL) { 
    return axios.post(API_URL + "equipment/offActive/"+equipId , null,{ headers: { Authorization:  authHeader(), Referers:requestURL}}); 
  }
  searchFilterEquipment(equipType,equipCatagory,requestURL) { 
    return axios.get(API_URL + "equipment/filterType/"+equipType+'/'+equipCatagory , { headers: { Authorization:  authHeader(), Referers:requestURL}}); 
  }
  allTooltipHwUpdateEquipment(hwCpu,hwDisk,hwNic,hwSensor,hwid,requestURL) {
    return axios.post(API_URL + "equipment/allTooltipHwUpdate/"+hwCpu+'/'+hwDisk+'/'+hwNic+'/'+hwSensor+'/'+hwid , null,{ headers: { Authorization:  authHeader(), Referers:requestURL}} ); 
  }
  eachTooltipHwUpdateEquipment(hwCpu,hwDisk,hwNic,hwSensor,hwid,requestURL) {
    return axios.post(API_URL + "equipment/eachTooltip/"+hwCpu+'/'+hwDisk+'/'+hwNic+'/'+hwSensor+'/'+hwid ,null,{ headers: { Authorization:  authHeader(), Referers:requestURL}} ); 
  }
  getTooltipByNo(hwid,requestURL) {
    return axios.get(API_URL + "equipment/getTooltipByNo/"+hwid, { headers: { Authorization:  authHeader(), Referers:requestURL}});
  }
  downloadExcel(requestURL) {
    return axios.get(API_URL + "equipment/downloadExcel", {responseType:'arraybuffer' , headers: { Authorization:  authHeader(), Referers:requestURL}});
  }
  uploadExcel(data,requestURL) {
    return axios.post(API_URL + "equipment/uploadExcel" , data ,{ headers: { Authorization:  authHeader(), Referers:requestURL}}); // { headers: { "Content-type": "multipart/form-data"}}
  }
}

export default new AiwacsService();