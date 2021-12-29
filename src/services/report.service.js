import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class ReportService {

    getSysCpuDisk(id,cpu,network,disk,startDate,endDate) {
      return axios.get(API_URL + "getStat/"+id+"?cpu="+cpu+"&network="+network+"&disk="+disk+"&startDate="+startDate+"&endDate="+endDate);
    }

    getStatistics(id, sys, disk, nic, startDate, endDate) {
      return axios.get(API_URL + "getStatistics/"+id+"?sys="+sys+"&disk="+disk+"&nic="+nic+"&startDate="+startDate+"&endDate="+endDate, null);
    }

    getReportDownloadPdf(chartData,requestURL) {
      return axios.post(API_URL + "getReportDownloadPdf", chartData, {responseType:'arraybuffer' ,headers: { Authorization:  authHeader(), Referers:requestURL }})
    }
}

export default new ReportService();