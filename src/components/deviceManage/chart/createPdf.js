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

const Prints = () => (
  // <div style={{ position: 'absolute', left: 0, top: -500 }}>
    <div id="printThis">
      <XYPlot width={700} height={300} yDomain={[0,100]} >
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis />
          <YAxis />
          <Line
            className="first-series"
            data={
              // [
              //   {x:this.props.option.chartOptions0_0.option.series[0].data[0], y: this.props.option.chartOptions0_0.option.series[1].data}
              // ]
              [{x: 1, y: 3}, {x: 2, y: 5}, {x: 3, y: 15}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}]
            }
            style={{ fill: 'none', stroke: 'rgb(0, 169, 255)' }}
          />
        </XYPlot>
    </div>
  // </div> 
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
      pdf.addImage(imgData, 'JPEG', 15, 40)
      pdf.save("download.pdf");
    })
};

class createPdf extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartPdf:{},
    }
  }
  
  componentDidUpdate(prevProps) {
    // if(this.props.option !== prevProps.option) {
    //   console.log("PDF");
    //   this.setState({chartPdf : this.props.option})
    // }
  }
  componentDidMount() {
    console.log("PDF");
    this.setState({chartPdf : this.props.option})
  }

  render() {
    console.log(this.state.chartPdf);



    return (
      <>
      <div style={{marginLeft:'20px', marginTop:'20px'}}> 
        <Button className="reportFilterReloadBtnPDF" onClick={print} >초기화</Button>
        {/* <Graph /> */}
        <Prints />
      </div>
      </>
    );
  }
}

export default createPdf;


