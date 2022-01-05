import React, { Component} from 'react';
import * as go from 'gojs';
import { DiagramWrapper } from './DiagramWrapper';


interface AppState {
  // ...
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedKey: number | null;
  skipsDiagramUpdate: boolean;
  test: Array<object>;
}

export class TopogolyEquipment extends Component<{}, AppState> {
  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [
        { key: 0, text: 'Alpha', color: 'white', loc: '0 0' },
        { key: 1, text: 'Beta', color: 'white', loc: '150 0' },
        { key: 2, text: 'Gamma', color: 'white', loc: '0 150' },
        { key: 3, text: 'Delta', color: 'white', loc: '150 150' }
      ],
      linkDataArray: [
        { key: -1, from: 0, to: 1 },
        { key: -2, from: 0, to: 2 },
        { key: -3, from: 1, to: 1 },
        { key: -4, from: 2, to: 3 },
        { key: -5, from: 3, to: 0 }
      ],
      modelData: {
        canRelink: true
      },
      selectedKey: null,
      skipsDiagramUpdate: false,
      test: []

    };
    
  }

  public handleDiagramEvent = (e: go.DiagramEvent)  => {
    console.log(e);
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        if (sel) {
          this.setState({ selectedKey: sel.key });
        } else {
          this.setState({ selectedKey: null });
        }
        break;
      }
      default: break;
    }
  }

  public handleModelChange = (obj: go.IncrementalData)  => {
    const insertedNodeKeys = obj.insertedNodeKeys;  // 삽입된 노드키
    const modifiedNodeData = obj.modifiedNodeData;  // 수정된 노드키
    const removedNodeKeys = obj.removedNodeKeys;      // 삭제된 노드키
    const insertedLinkKeys = obj.insertedLinkKeys;   // 삽입된 링크키
    const modifiedLinkData = obj.modifiedLinkData;    // 수정된 링크키
    const removedLinkKeys = obj.removedLinkKeys;      // 삭제된 링크키
    const modifiedModelData = obj.modelData;  // 모델 데이터

    console.log(obj)
    
    this.setState({nodeDataArray :this.state.nodeDataArray.concat(modifiedNodeData[0])})
  }

  public handleRelinkChange = (e: any) => {
    console.log(e);
    
    const target = e.target;
    const value = target.checked;
    this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false });
  }

  public render = () => {
    let selKey;
    if (this.state.selectedKey !== null) {
      selKey = <p>Selected key: {this.state.selectedKey}</p>;
    }
  const { nodeDataArray } = this.state;
  console.log(nodeDataArray);
  
    return (
      <div style={{marginLeft:'200px', marginTop:'100px'}}>
        <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          linkDataArray={this.state.linkDataArray}
          modelData={this.state.modelData}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
        />
        <label>
          Allow Relinking?
          <input
            type='checkbox'
            id='relink'
            checked={this.state.modelData.canRelink}
            onChange={this.handleRelinkChange} />
        </label>
        {selKey}
      </div>
    );
  }
}