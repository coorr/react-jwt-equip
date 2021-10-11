import React from "react";


class dropableContainer extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.state = {
      focusDropContainer: false
    };
  }

  onDrop(e) {
    console.log("DropableArea:onDrop", e);

    this.props.onDrop(e);

    // remove: styles
    this.setState({ ...this.state, focusDropContainer: false });
  }

  onDragOver(e) {
    // console.log('DropableArea:onDragOver');
    e.preventDefault();
  }

  onDragEnter() {
    console.log("DropableArea:onDragEnter");
    // apply: styles
    this.setState({ ...this.state, focusDropContainer: true });
  }

  onDragLeave() {
    console.log("DropableArea:onDragLeave");
    // remove: styles
    this.setState({ ...this.state, focusDropContainer: false });
  }

  render() {
    const focusStyle = this.state.focusDropContainer ? "focus-drop-container" : "";
    const dropedItems = this.props.items || [];
    return (
      <div>
        <div
          className={"dropable-container " + focusStyle}
          onDrop={event => this.onDrop(event)}
          onDragOver={e => this.onDragOver(e)}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          <p style={{ textAlign: "center" }}>drop nodes here</p>

          <div>
            <ul>
              {dropedItems.map(item => (
                <li key={item}> {item} </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default dropableContainer;
