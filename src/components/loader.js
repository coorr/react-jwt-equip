import React,{Component} from 'react'; 
import reload from '../images/reload.gif'

export default class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  render() {
    return (
      <div style={{position:'absolute',top:'50%', left:'50%',zIndex:9999,}}>
          <img style={{width:50,padding:1}} src={reload} alt="Custom Icon" />
      </div>
    )
  }
}