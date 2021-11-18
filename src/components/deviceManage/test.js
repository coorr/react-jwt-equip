import React, { PureComponent } from 'react';

const Counter = ({ name, value })  => {
  console.log(name);
  console.log(`Rendering counter ${name}`);
  return (
    <div>
      {name}: {value}
    </div>
  );
}



class test extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      counterA:0,
      counterB:0,
      Areadata:[{
        id:1,
        name:"ㅇㅇ",
        Thumbnail_text:"ㅇㅇㅁㅁ",
      },
      {
        id:2,
        name:"ㅇㅇㄴㄴ",
        Thumbnail_text:"ㅇㅇㅁㅁㄴㄴ",
      },
    ]
    }
  }

  // shouldComponentUpdate(prevProps, prevState) {
  //   return this.state.counterB !== prevState.counterB;
  // }

  render() {
    const { counterA,counterB,Areadata } = this.state;
    return (
      <div style={{marginTop:'70px', marginLeft:'100px'}}>

{Areadata.map(data => (
                  
                  <li key={data.id} >
                    <div>
                      {/* <img  src={`${data.Thumbnail_img}`} alt={data.Tourlist_name} /> */}
                      
                    </div>
                    <div>
                      <p>{data.name}</p>
                      <p>{data.Thumbnail_text}</p>
                    </div>
                </li>
            
          ))}
       {/* <Counter name="A" value={counterA} />
       <Counter name="B" value={counterB} />
      <button
        onClick={() => {
          console.log("Click button");
          this.setState({ counterA: counterA + 1 }) 
        }}
      >
        Increment counter A
      </button> */}
      </div>
    );
  }
}


// constructor(){
//   super();
//   this.state={
//     count:10
//   }
// }

// render(){
//   console.warn('render');
//   return (
//     <div className="App" style={{marginTop:'50px', marginLeft:'100px'}}>
//       <header className="App-header">
//         <h1>Pure Component State Count {this.state.count}</h1>
        
//         <button onClick={()=>{this.setState({count:20})}}>Update Count</button>
//       </header>
//     </div>
//   );
// }

export default test;