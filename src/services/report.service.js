import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class ReportService {

    getSysCpuDisk(id,startDate,endDate) {
    return axios.get(API_URL + "getStat?id="+id+"&startDate="+startDate+"&endDate="+endDate);
    }

// getSelectHistory(size,searchDatas,action,firstDate,secondDate) {
// return axios.get(API_URL + "getSelectHistory?size="+size+"&user="+searchDatas+"&action="+action+"&firstDate="+firstDate+"&secondDate="+secondDate);
// }

    // createEquipment(equipment,requestURL) {
    //     return axios.post(API_URL + "equipment" , equipment, { headers: { Authorization:  authHeader(), Referers:requestURL}}); 
    // }
    // getEquipment() {
    //     return axios.get(API_URL + "getEquipment" ,);
   
    // getTooltipByNo(hwid,requestURL) {
    //   return axios.get(API_URL + "equipment/getTooltipByNo/"+hwid, { headers: { Authorization:  authHeader(), Referers:requestURL}});
    // }
    // downloadExcel(requestURL) {
    //   return axios.get(API_URL + "equipment/downloadExcel", {responseType:'arraybuffer' , headers: { Authorization:  authHeader(), Referers:requestURL}});
    // }
    // uploadExcel(data,requestURL) {
    //   return axios.post(API_URL + "equipment/uploadExcel" , data ,{ headers: { Authorization:  authHeader(), Referers:requestURL}}); // { headers: { "Content-type": "multipart/form-data"}}
    // }
}

export default new ReportService();