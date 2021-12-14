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
import CustomLineChart from './chart/CustomLineChart';
import TestDocument from './chart/TestDocument';
import  ChartSvg  from './chart/chart.js'
import createPdfWithChart from './chart/createPdf.js'

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

class test extends Component {

  componentDidMount() {
  }

  render() {
    return (
      <>
      <div style={{marginLeft:'200px', marginTop:'200px'}}> 
        <ChartSvg>
          <CustomLineChart  />
        </ChartSvg>
          <button 
            onClick={
              async () => {
                // const pdf = await createPdfWithChart();
                // console.log(pdf);
              // const pdf = await CustomLineChart();
              // const pdfPath = 'document1.pdf';
              // const asPdf = pdf([]);
              // const blob = pdf.toBlob();
              // saveAs(blob, 'document.pdf');
              // fs.readFileSync(pdfPath);

              // const props = await getProps();
              const pdfPath ='aa.pdf';
              const doc = <TestDocument  />;
              console.log(doc);
              const asPdf = pdf([]); // {} is important, throws without an argument
              console.log(asPdf);
              asPdf.updateContainer(doc);
              console.log(asPdf);
              const blob = await asPdf.toBlob();
              console.log(blob);
              saveAs(blob, 'document.pdf');
            }}
          >
        Download PDF
      </button>
      </div>
      </>
    );
  }
}

export default test;


