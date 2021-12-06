import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class ReportService {

    getSysCpuDisk(id,cpu,network,disk,startDate,endDate) {
    return axios.get(API_URL + "getStat/"+id+"?cpu="+cpu+"&network="+network+"&disk="+disk+"&startDate="+startDate+"&endDate="+endDate);
    }

    getStatistics(id, sys, disk, nic, startDate, endDate) {
      return axios.get(API_URL + "getStatistics/"+id+"?sys="+sys+"&disk="+disk+"&nic="+nic+"&startDate="+startDate+"&endDate="+endDate);
  }
}

export default new ReportService();