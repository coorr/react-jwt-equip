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
} from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import '../../css/reportResource.css'
import ChartComponent from './ChartComponent';
import iimage from '../../images/equipment.png'
import fs from 'fs'
import Graph from './chart/Graph.js'

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


const chartData =  {
  chart: {
    type: 'line'
  },
  title: {
    text: null,
    align: 'left',
    style: {
        fontSize: "12px"
    }
  },
  xAxis: {
    categories: [1,2,3,4,5],
    labels: {align:'center'}
  },
  series: [
    {
      data: [1,2,3,4,5],
      name: 'kim'
    }
  ],
  yAxis: {
    title: { text: '' },
    min:0, 
  }
};

const Testaa = () => {
  return (
    <>
     <div><p>adasdasd</p></div>
    </>
  )
}

let datas = ["aa","bb"]

const Chart = () => {
  return (
    <Graph  />
  )
}

function charts()  {
  console.log("aa");
  return (
    <ChartComponent option={chartData}  />
  )
}

const aa = () => {
  return (
    <div>
      <p>aaa</p>
    </div>
  )
}


const DocumentPdf = ({ someString }) => {
  return (
      <Document>
        <Page>
        <Image src={Chart}   />
          <View >
            {
              datas.map((d,k) => (
                <>
                  <Text key={k}>Hey look at this string: {someString} </Text>
                  <Text value={date}>1123123123</Text>  
                  <Canvas
                    paint={painter => painter.circle(50, 50, 10).fill('#FF3300')}
                    style={styles.circle}
                  />
                </>
              ))
            }
           
            {/* <Testaa /> */}
          </View>
        </Page>
    </Document>
  )
}
const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
async function getProps() {
  await delay(1_000);
  return ({
    someString: 'You waited 1 second for this',
  });
}


class test extends Component {

  componentDidMount() {
    console.log(date);
  }

  render() {
    return (
      <>
      <div style={{marginLeft:'200px', marginTop:'200px'}}> 
      <ChartComponent  />
          <button 
            onClick={
              async () => {
              const props = await getProps();
              const doc = <DocumentPdf {...props} />;
              const asPdf = pdf([]); // {} is important, throws without an argument
              asPdf.updateContainer(doc);
              const blob = await asPdf.toBlob();
              saveAs(blob, 'document.pdf');
            }}
          >
        Download PDF
      </button>
      <Graph />
      </div>
      </>
    );
  }
}

export default test;


