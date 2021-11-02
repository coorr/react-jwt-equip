import axios from "axios";

const API_URL = 'http://localhost:8080/api/manage/';

class HistoryRecord { 
  getHistoryRecord() {
    return axios.get(API_URL + "getHistoryRecord");
  }
  getUserHistory() {
    return axios.get(API_URL + "getUserHistory");
  }
}

export default new HistoryRecord();