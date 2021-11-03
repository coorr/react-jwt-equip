import axios from "axios";

const API_URL = 'http://localhost:8080/api/manage/';

class HistoryRecord { 
  getHistoryRecord() {
    return axios.get(API_URL + "getHistoryRecord");
  }
  getUserHistory() {
    return axios.get(API_URL + "getUserHistory");
  }
  getSelectHistory(user,action) {
    return axios.get(API_URL + "getSelectHistory/"+user+"/"+action);
  }
}

export default new HistoryRecord();