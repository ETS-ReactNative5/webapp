import React, { Component } from 'react';
import "./Chatbox.css";
import { Input } from 'reactstrap';

export default class Chatbox extends Component {

	constructor (props) {

		super(props);
		this.count = 0;
		this.state = {
			messages: []
		}

		this.props.master.addMessage = (name, text) => this.add(name, text);
	}

	add (name, text) {

		if (name >= 0 && name <= 4) {
			switch (name) {
			case 0: name = "Vous"; break;
			case 1: name = "Adversaire"; break;
			case 2: name = "Joueur 1"; break;
			case 3: name = "Joueur 2"; break;
			case 4: name = "Spectateur"; break;
			default: name = "?"; break;
			}
		}

		var id = this.count++;
		this.state.messages.push({ from: name || "?", text, id });
		var history = document.getElementById("sensuba-chat-history");
		this.setState( { messages: this.state.messages } , () => history.scrollTop = history.scrollHeight);
		setTimeout(() => {
			var messages = this.state.messages.filter(m => m.id !== id);
			this.setState( { messages: messages } );
		}, 120000)
	}

	submit (e) {

		var el = document.getElementById("sensuba-chat-input");
		e.preventDefault();
		this.props.master.props.socket.emit("chat", el.value);
		el.value = "";
	}

  render () {

    return (
    	<div className="sensuba-chatbox">
    		<div id="sensuba-chat-history" className="sensuba-chat-history">
    		{
    			this.state.messages.map(m => 
    				<div key={m.id} className="sensuba-chat-message">
    					<div className="sensuba-chat-message-author">{ m.from + ":" }</div>
    					<div className="sensuba-chat-message-text">{ m.text }</div>
    				</div>
    			)
    		}
    		</div>
    		<form autoComplete="off" onSubmit={e => this.submit(e)}>
    			<Input id="sensuba-chat-input" className="sensuba-chat-input" defaultValue=""/>
    		</form> 
    	</div>
    )
  }
}