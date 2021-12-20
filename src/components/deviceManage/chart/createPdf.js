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

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas
} from "react-vis";
import '../../../css/reportResource.css'
import Graph from './Graph.js'
import jsPDF from "jspdf"; // check the docs for this: https://parall.ax/products/jspdf
import html2canvas from 'html2canvas';
import fontFile from './fontFile';
import Moment from 'moment';
import {Button} from "react-bootstrap";
import _ from "lodash";



let chartPdfAry = null;
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
const Line = LineSeries;
let lineData = {};

const Prints = () => (
  // <div style={{ position: 'absolute', left: 0, top: -500 }}>
    <div id="printThis">
      {
        // _.map(chartPdfAry, (c,ckey) => (
          <div class="printThiss">
            {/* <p style={{fontWeight:'bold'}}>{c.resourceName}</p> */}
            <XYPlot width={700} height={300}  >
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis />
            <YAxis />
            <LineSeries
              // key={ikey}
              className="first-series"
              data={
                [{x: 1, y: 3}, {x: 2, y: 5}, {x: 3, y: 15}, {x: 4, y: 12}, {x: 4, y: 12}, 
                  {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}]
              }
              style={{ fill: 'none', stroke: 'rgb(0, 169, 255)' }}
            />
            
          </XYPlot>
          </div>
          
        // ))
      }
    </div>
  // </div> 
);


class createPdf extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartPdf:{},
    }
  }
  componentDidMount() {
    this.setState({chartPdf : this.props.option})
    chartPdfAry = this.props.option
  }

print = () => {
  const input = document.getElementById('printThis');
  let inputs = document.querySelectorAll('.printThiss');
  console.log(inputs);
  console.log(inputs.length);
  console.log(inputs[0]);
  console.log(inputs[0].height);
  html2canvas(input)
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      let pdf = new jsPDF('p','mm','a4');
      const imgProps= pdf.getImageProperties(imgData);
      
      let imgWidth = 450; 
      let pageHeight = 295;  
      let imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      let font = fontFile;
      let renderedImg = new Array;
      let imageLength = inputs.length;
      console.log(imageLength);
      console.log(inputs.length);
      let sorted = renderedImg.sort(function(a,b) { return a.num < b.num ? -1 : 1})
      
      pdf.addFileToVFS("Amiri-Regular.ttf", font);
      pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");

      pdf.setFont("helvetica",'bold');
      pdf.text(90, 25, 'AiWACS Report') 

      let date = Moment(new Date(), "YYYY.MM.DD HH.mm.ss").format("YYYY-MM-DD HH:mm:ss")
      pdf.setFont("normal","normal");
      pdf.setFontSize(10);
      // pdf.text(150, 35, "출력일시:");
      pdf.text(170, 35, date)
      
      // pdf.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight-100  )
      // // pdf.addPage();
      // console.log(imgHeight);
      // console.log(canvas.height);
      // heightLeft -= pageHeight;  // -295만 빼서 나오는 값일텐데 

      // while( heightLeft >= 0) {
      //   position = heightLeft - imgHeight; // top padding for other pages
      //   console.log(position);
      //   console.log(heightLeft);
      //   console.log(canvas.height);
      //   pdf.addPage();
      //   pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight );
      //   heightLeft -= pageHeight; 
      //   console.log(pageHeight);
      //   console.log(heightLeft);
      // }

      // pdf.html(document.getElementById('printThis'),{margin: 100}, pdf.save("download.pdf") )
      pdf.save('document.pdf')
      if(inputs.length === imageLength) {
        // pdf.save("download.pdf")
      }
    })
  
};

  render() {
    console.log(this.state.chartPdf);
    console.log(chartPdfAry);
    
    return (
      <>
      <div style={{marginLeft:'20px', marginTop:'20px'}}> 
        <Button className="reportFilterReloadBtnPDF" onClick={this.print} >초기화</Button>
        {/* <Graph /> */}
        <Prints />
      </div>
      </>
    );
  }
}

export default createPdf;

