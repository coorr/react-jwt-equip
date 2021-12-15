import React, { Component } from 'react';
import {
  pdf,
  Document,
  Page,
  Text,
  title,
  View,
  Canvas,
  StyleSheet,
  Image,
  renderToFile,
} from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import '../../css/reportResource.css'
import ChartComponent from './ChartComponent';
import iimage from '../../images/equipment.png'
import  { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';
import Graph from './chart/Graph.js'
import jsPDF from "jspdf"; // check the docs for this: https://parall.ax/products/jspdf
import html2canvas from 'html2canvas';
import fontFile from './chart/fontFile';
import Moment from 'moment';

const date = new Date();



const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },

  circle: {
    width: 100,
    height: 300,
    backgroundColor: 'gray',
  },
  ttest: {
    backgroundColor: 'gray'
  }
});

const path = require('path');

const Prints = () => (
  <div style={{ position: 'absolute', left: 0, top: -500 }}>
    <div id="printThis">
      <Graph />
    </div>
  </div> 
);

const print = () => {
  
  
  const input = document.getElementById('printThis');
  html2canvas(input)
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      let pdf = new jsPDF('p','mm','a4');
      let font = fontFile;
      console.log(font);

      pdf.addFileToVFS("Amiri-Regular.ttf", font);
      pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");

      pdf.setFont("helvetica",'bold');
      pdf.text(90, 25, 'AiWACS Report')

      let date = Moment(new Date(), "YYYY.MM.DD HH.mm.ss").format("YYYY-MM-DD HH:mm:ss")
      pdf.setFont("normal","normal");
      pdf.setFontSize(10);
      pdf.text(150, 35, "출력일시:");
      pdf.text(170, 35, date)

      pdf.text(20, 45,"조회대상")
      // pdf.addImage(imgData, 'JPEG', 15, 40)
      pdf.save("download.pdf");
    })
};

class test extends Component {

  render() {
    return (
      <>
      <div style={{marginLeft:'200px', marginTop:'200px'}}> 
          <Graph />
          <button 
            onClick={print}
          >
        Download PDF
      </button>
      <Prints />
      </div>
      </>
    );
  }
}

export default test;


