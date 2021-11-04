import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class HistoryRecord { 
  getHistoryRecord() {
    return axios.get(API_URL + "getHistoryRecord");
  }
  getUserHistory() {
    return axios.get(API_URL + "getUserHistory");
  }
  getSelectHistory(user,action,firstDate,secondDate) {
    return axios.get(API_URL + "getSelectHistory/"+user+"/"+action+"/"+firstDate+"/"+secondDate);
  }
  historyDownloadExcel(user,firstDate,outDate) {
    return axios.get(API_URL + "history/historyDownloadExcel/"+user+"/"+firstDate+"/"+outDate, {responseType:'arraybuffer' , headers: authHeader()});
  }

  
}

export default new HistoryRecord();