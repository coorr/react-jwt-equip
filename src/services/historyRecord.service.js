import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class HistoryRecord { 
  getHistoryRecord() {
    return axios.get(API_URL + "getHistoryRecord");
  }
  getHistoryUser() {
    return axios.get(API_URL + "getHistoryUser");
  }
  getSelectHistory(size,searchDatas,action,firstDate,secondDate) {
    return axios.get(API_URL + "getSelectHistory?size="+size+"&user="+searchDatas+"&action="+action+"&firstDate="+firstDate+"&secondDate="+secondDate);
  }
  historyDownloadExcel(user,firstDate,outDate,requestURL) {
    return axios.get(API_URL + "history/historyDownloadExcel/"+user+"/"+firstDate+"/"+outDate, {responseType:'arraybuffer' , headers: { Authorization:  authHeader(), Referers:requestURL}} );
  }
  

  
}

export default new HistoryRecord();