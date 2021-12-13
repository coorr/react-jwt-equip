import React, { Component } from 'react';
import {
  pdf,
  Document,
  Page,
  Text,
  title,
  View,
} from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const date = new Date();


const DocumentPdf = ({ someString }) => {
  return (
      <Document>
        <Page>
          <View >
            <Text>Hey look at this string: {someString} </Text>
            <Text value={date}>1123123123</Text>  
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
          <button 
            onClick={async () => {
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
      </div>
      </>
    );
  }
}

export default test;


