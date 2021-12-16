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
        _.map(chartPdfAry, (c,ckey) => (
          <div key={c.key}>
            <p style={{fontWeight:'bold'}}>{c.resourceName}</p>
            <XYPlot width={700} height={300}  >
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis />
            <YAxis />
            {/* {
              _.map(c.option.series, (d,dkey) => (
                d.length !== 0 && console.log(dkey)
                //  <div key={c.key}>
                //    {
                //      _.map(d.data, (z,zkey) => (
                //         z.length !== 0 && console.log(z)
                //       ))
                //    }
                //  </div>
              ))
            }  */}
            <LineSeries
              // key={ikey}
              className="first-series"
              data={

                [{x: 1, y: 3}, {x: 2, y: 5}, {x: 3, y: 15}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}, {x: 4, y: 12}]
                // [{x:ikey+1, y:i}]
              }
              style={{ fill: 'none', stroke: 'rgb(0, 169, 255)' }}
            />
            
          </XYPlot>
          </div>
          
        ))
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
    console.log("PDF");
    this.setState({chartPdf : this.props.option})
    chartPdfAry = this.props.option
  }


   print = () => {
    const input = document.getElementById('printThis');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        let pdf = new jsPDF('p','mm','a4');
        let imgWidth = 450; 
        let pageHeight = 295;  
        let imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        let font = fontFile;
        
        pdf.addFileToVFS("Amiri-Regular.ttf", font);
        pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  
        pdf.setFont("helvetica",'bold');
        pdf.text(90, 25, 'AiWACS Report')
  
        let date = Moment(new Date(), "YYYY.MM.DD HH.mm.ss").format("YYYY-MM-DD HH:mm:ss")
        pdf.setFont("normal","normal");
        pdf.setFontSize(10);
        // pdf.text(150, 35, "출력일시:");
        pdf.text(170, 35, date)
        console.log(pdf.getLineHeight());
        
        pdf.addImage(imgData, 'PNG', 15, 0, imgWidth, imgHeight  )

        heightLeft -= pageHeight;

        while( heightLeft >= -0) {
          position = heightLeft - imgHeight; // top padding for other pages
          console.log(position);
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight );
          heightLeft -= pageHeight;
        }
        pdf.html(document.getElementById('printThis'),{margin: 100}, pdf.save("download.pdf") )
        // pdf.save("download.pdf");
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


