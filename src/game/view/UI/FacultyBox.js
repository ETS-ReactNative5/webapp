import React, { Component } from 'react';
import Faculty from "./Faculty.js";
import "./Faculty.css";

export default class FacultyBox extends Component {

  render () {

    return (
    	<div className={"faculty-box faculty-box-" + this.props.faculties.length}>
      {
        this.props.faculties.map((f, i) => <Faculty key={i} src={f} select={this.props.select} master={this.props.master}/>)
      }
		</div>
    )
  }
}