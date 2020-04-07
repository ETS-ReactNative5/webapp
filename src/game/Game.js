import React, { Component } from 'react';
import './Game.css';
import Manager from './Manager';
import Sequencer from './Sequencer';
//import Model from './model/board/GameBoard';
import View from './view/board/GameBoard';
import User from '../services/User';
//import Card from './view/board/Card';
//import CardModel from './model/board/Card';
import CardPreview from '../components/cards/Card';
//import WaitingState from './controller/state/WaitingState';
//import PlayingState from './controller/state/PlayingState';
import Loader from '../components/utility/Loader';
import FacultyBox from './view/UI/FacultyBox';
import History from './view/UI/History';
import MuteButton from './view/UI/MuteButton';
import Lightbox from '../components/utility/Lightbox';
import { Button } from 'reactstrap';
//import files from '../utility/FileManager';

import { createStore } from 'redux';
import reducers from './reducers';

const defaultDecks = [{
  hero: 1,
  body: [
    103, 103, 105, 105, 117,
    117, 126, 126, 130, 130,
    132, 132, 150, 150, 325,
    325, 157, 157, 160, 160,
    177, 177, 108, 108, 302,
    302, 328, 328, 336, 336
  ]
}, {
  hero: 2,
  body: [
    101, 101, 103, 103, 105,
    105, 115, 115, 226, 226,
    137, 137, 165, 165, 167,
    167, 169, 169, 185, 185,
    212, 212, 340, 340, 232,
    232, 233, 233, 318, 318
  ]
}, {
  hero: 3,
  body: [
    103, 103, 105, 105, 110,
    110, 112, 112, 124, 124,
    104, 104, 131, 131, 136,
    136, 145, 145, 152, 152,
    156, 156, 167, 167, 192,
    192, 173, 173, 320, 320
  ]
}];

export default class Game extends Component {

  constructor (props) {

    super(props);

    this.store = createStore(reducers);
    this.store.subscribe(() => {
      this.setState({model: this.store.getState()}, () => this.manager.control(this.isPlaying, this.state));
    });

    var myDeck = User.getDeck();
    if (myDeck)
      myDeck = JSON.parse(myDeck);
    var d = (User.isConnected() && myDeck) ? myDeck : this.getDefaultDeck();

    this.state = {

      model: this.store.getState(),
      messages: [],
      deck: d,
      timer: props.room !== undefined
    }

    this.manager = new Manager(this.state.model, this.command.bind(this), state => state ? this.setState(state) : this.forceUpdate());
    this.sequencer = new Sequencer(this, this.state.model, this.store.dispatch);

    this.props.socket.removeAllListeners();

    var name = "", avatar = "";
    if (User.isConnected()) {
      var user = User.getData();
      name = user.username;
      avatar = user.avatarUrl;
    }

    if (props.room) {
      this.props.socket.emit("join", name, avatar, props.room);
      this.props.socket.on('joined', role => this.onJoined(role));
    } else if (props.mission) {
      this.props.socket.emit("mission", name, avatar, props.mission);
      this.no = 0;
      this.props.socket.on('notification',  this.analyse.bind(this));
    }
    this.props.socket.on('endgame', data => this.onEndgame(data));
    ['error', 'connect_failed', 'reconnect_failed', 'connect_error', 'reconnect_error'].forEach(trigger => this.props.socket.on(trigger, () => this.onError()));

    //Library.getCard(d.hero, hero => this.setState({hero}));

    this.createParticle = () => {};
  }

  onJoined (role) {

    if (role.as === 'player') {
        this.no = role.no;
        this.props.socket.emit('prepare', User.isConnected() ? User.getData().token : "Anonymous", this.state.deck);
      }

      this.props.socket.on('notification',  this.analyse.bind(this));
  }

  onEndgame (data) {

    if (User.isConnected() && data.credit) {
      var credit = User.getData().credit + data.credit;
      User.updateCredit(credit);
      this.setState({credit: {gain: data.credit, total: credit}});
    }
    this.sequencer.add({type: "end", src: 0, data: [{type: "int", no: data.state}]});
  }

  onError () {

    if (this.state.model.started)
      this.sequencer.add({type: "end", src: 0, data: [{type: "int", no: 6}]});
    else
      this.props.quitRoom();
  }

  componentWillUnmount () {

    this.props.socket.emit('quit');
    this.props.socket.removeAllListeners();
  }

  getDefaultDeck () {

    return defaultDecks[Math.floor(Math.random()*defaultDecks.length)];
  }

  analyse (n) {

    if (n.type === "init") {
      this.props.updateHeroes(n.data[(this.no || 0)*3+2].no, n.data[(1-(this.no || 0))*3+2].no);
      var model = this.state.model;
      model.areas[0].name = n.data[0].value;
      model.areas[0].avatar = n.data[1].value;
      model.areas[1].name = n.data[3].value;
      model.areas[1].avatar = n.data[4].value;
    }
    if (n.type === "identify" && this.no !== undefined && n.data[0].cardType === "hero" && this.state.model.areas[this.no].field.tiles[6].occupied && this.state.model.areas[this.no].field.tiles[6].card.id.no === n.data[0].id.no)
      this.setState({ hero: n.data[0] });
    this.sequencer.add(n);
  }

  command (command) {

    this.props.socket.emit('command', command);
  }

  select (e) {

    this.manager.select(e);
  }

  shiftMessage () {

    this.setState({"messages": this.state.messages.slice(1, this.state.messages.length)});
  }

  saveReplay () {

    /*var generateName = () => {

      let name = "replay-";
      let today = new Date();
      name += today.getDate() + "-" + (today.getMonth()+1) + "-" + today.getFullYear();
      name += "#" + Math.floor(Math.random() * 100000);
      return name;
    }

    files.download(JSON.stringify(this.state.model.log.logs), generateName(), "application/json");*/

    if (this.replaySaved)
      return;

    var replayUrl = "https://sensuba.com/replay/" + this.props.room /*response.data.idRoom*/;
    this.copyToClipboard(replayUrl);
    this.replaySaved = true;
    document.getElementById("replay-button").classList.add("replay-copied");
    this.props.api.saveReplay({idRoom: this.props.room, log: JSON.stringify(this.state.model.log.logs)}, response => {
      //this.props.quitRoom();
    });
  }

  copyToClipboard (str) {
    var el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  get waiting () {

    return !this.state.model.started;
  }

  get isPlaying () {

    var ca = this.state.model.currentArea;
    return ca ? ca.id.no === this.no : false;
  }

  get isReplay () {

    return false;
  }

  switchMute () {

    this.mute = !this.mute;
  }

  render() {
    return (
      <div>
      <Lightbox open={this.state.model.gamestate > 0} onClose={this.props.quitRoom}>
        <div id="endgame-window">
          <h2>{ (["", "", "Egalité !", "Victoire !", "Défaite...", "Erreur de connexion :/", "Erreur interne *-*"])[this.state.model.gamestate] }</h2>
          { this.state.model.gamestate > 1 ?
            <div>
              <CardPreview src={this.state.hero} level={1} model={this.state.hero}/>
              { User.isConnected() && this.state.credit ? <div className="sensuba-endgame-credits">Obtenu: <span className="sensuba-credits">{this.state.credit.gain}</span> | Total: <span className="sensuba-credits">{this.state.credit.total}</span></div> : <span/> }
            </div> : <span/>
          }
          { this.props.room ? <Button onClick={() => this.saveReplay()} id="replay-button" className="modern-sensuba-button replay-button">Enregistrer</Button> : <span/> }
          <Button onClick={this.props.quitRoom} className="proceed-button">Continuer</Button>
        </div>
      </Lightbox>
      <Lightbox open={this.state.concedeWindow} onClose={() => this.setState({concedeWindow: false})}>
        <div id="concede-window">
          <h2>Abandonner ?</h2>
          <Button onClick={() => { this.command({ type: "concede" }); this.setState({concedeWindow: false}); }} className="proceed-button">Abandonner</Button>
        </div>
      </Lightbox>
      <div id="faculty-tooltip" data-toggle="tooltip" data-placement="right" data-animation="false" data-trigger="manual" /*style={{marginTop: "-" + (this.state.faculties ? this.state.faculties.length-1 : 0) + "em"}}*/>
        { this.state.faculties && this.state.faculties.length > 0 ? <FacultyBox faculties={ this.state.faculties } select={m => this.manager.select(m)} master={this}/> : <span/> }
      </div>
      <div id="deck-count-tooltip" data-toggle="tooltip" data-placement="left" data-animation="false" data-trigger="manual">
        { this.state.deckcount ? ("You" + (this.state.deckcount.you ? " have " : "r opponent has ") + this.state.deckcount.count + " card" + (this.state.deckcount.count > 1 ? "s" : "") + " left.") : "" }
      </div>
      <div id="img-preview-tooltip" data-toggle="tooltip" data-placement="right" src="" alt="preview" data-animation="false" data-trigger="manual">
        { this.state.preview ? <CardPreview src={this.state.preview} level={this.state.preview.level} model={this.state.preview.model}/> : <span/> }
      </div>
      {
        this.waiting
        ? 
          <div className="waiting-room">
            <Loader type="connect"/>
            <div className="waiting-text">
              { this.props.room ? "En attente d'un adversaire..." : "En attente du serveur..." }
              <br/><span className="small-text">{ this.props.room ? "Pour affronter un ami, partagez-leur l'url." : "" }</span>
            </div>
          </div>
        : <span/>
      }
      <div style={{ display: this.waiting ? "none" : "block" }}>
        <View model={this.state.model} messages={this.state.messages} master={this} openConcedeWindow={() => this.setState({concedeWindow: true})}/>
        <div id="screen-anim" className="screen-anim"><div className="screen-anim-inner"/></div>
      </div>
      <MuteButton switch={() => this.switchMute()} master={this}/>
      <History entries={this.state.model.log.history} master={this}/>
      <div id="newturn-frame">
        <h1 className="big-text">A vous de jouer</h1>
      </div>
      </div>
    );
  }
}