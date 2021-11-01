import axios from "axios";

const API_URL = 'http://localhost:8080/api/manage/';

class HistoryRecord { 
  getHistoryRecord() {
    return axios.get(API_URL + "getHistoryRecord");
  }
}

export default new HistoryRecord();