import { createChatMessage, updateChatMessage } from './graphql/mutations.js';
import { onCreateChatMessage } from './graphql/subscriptions.js';
import { listChatMessages, chatMessagesByCourse } from './graphql/queries.js';
import aws_exports from './aws-exports';
import React, { Component } from 'react';
import logo from './oktanklogo.png';
import './App.css';
import JsonTable from 'ts-react-json-table';
import Popup from 'react-popup';
import Amplify, { API, graphqlOperation, Auth, Hub } from "aws-amplify";

Amplify.configure(aws_exports);

class ChatContent extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			chatMessages: [],
			inputMessage: '',
			username: '',
			course: 3		
		};

		this.handleInputChange = this.handleInputChange.bind(this)
	}

	tableSettings = {
		header: false,
		cellClass: (currentClass, columnKey, rowData) => {
			if(columnKey === 'createdAt'){
				return 'columnChatsTime';
			}else if(columnKey === 'message'){
				return 'columnChatsMessage';
			}else if(columnKey === 'username'){
				return 'columnChatsUsername';
			}
		}
	}

	tableColumns = [{
		key: 'username',
		label: 'username:'
	}, {
		key: 'message',
		label: 'message',
	}, {
		key: 'createdAt',
		label: 'createdAt',
		cell: (row, columnKey) => {
			return new Date(row[columnKey]).toLocaleTimeString('en-US');
		}
	}];

	handleInputChange(event) {
		this.setState({inputMessage: event.target.value});
	}

	componentDidMount(){
		this.listenForChatMessages();
		this.loadChatMessages();
		this.setState({username: this.props.username});
	}

	loadChatMessages = () => {
		let self = this;

		API.graphql(
			graphqlOperation(chatMessagesByCourse, { course: this.state.course })
		).then(response => {
			
			let chats = response.data.chatMessagesByCourse.items;
			
			self.setState({
				chatMessages: chats
			});

			console.log(self.state.chatMessages);
		});
	}

	listenForChatMessages = () => {
		let self = this;
		API.graphql(
			graphqlOperation(onCreateChatMessage)
		).subscribe({
			next: (data) => {

				let chats = this.state.chatMessages;
				let incomingChat = data.value.data.onCreateChatMessage;
				
				//verify this message is for the right ccourse
				if(incomingChat.course === this.state.course){
					chats.push(incomingChat);

					self.setState({
						chatMessages: chats
					});
					console.log(self.state.chatMessages);
				}else{
					console.log("not for this course");
				}
			}
		})
	}

	//Catch the <enter> key
	evalKeyPress = (event) => {
		if (event.keyCode === 13) {
            this.onSendCell();
        }
	}

	onSendCell = (event) => {
		if (this.state.inputMessage.length > 0) {

			const message = {
				input: {
					username: this.state.username,
					message: this.state.inputMessage,
					course: this.state.course
				}
			}

			API.graphql(
				graphqlOperation(createChatMessage, message)).then(response => {
				
				console.log(response.data.createChatMessage);

				this.setState({
					inputMessage: ''
				});
			}).catch((err) => {
				console.log("err: ", err);
			});
			;
		} 
	}

	render() {
		return (
			<div className="containerChat">
				<JsonTable rows={this.state.chatMessages} columns={this.tableColumns} settings={this.tableSettings} className="tableChats" />
				<div className="controllerChat"><input type="text" name="chatMessageInput" className="textChatInput" value={this.state.inputMessage} onChange={this.handleInputChange}  onKeyDown={(e) => this.evalKeyPress(e) } /><button onClick={this.onSendCell}>Send</button></div>
			</div>
		);
	}
}

class VideoContent extends React.Component {

	constructor(props){
		super(props);
		this.state = {

		};
	}


	constraints = window.constraints = {
		audio: false,
		video: true
	  };

	handleSuccess = (stream) => {
		//debugger;
		const videoTracks = stream.getVideoTracks();
		console.log('Got stream with constraints:', this.constraints);
		console.log(`Using video device: ${videoTracks[0].label}`);
		window.stream = stream; // make variable available to browser console
		this.player.srcObject = stream;
	  }

	showVideo = (event) => {
		const foo = 0 ;
		
		navigator.mediaDevices.getUserMedia(this.constraints).
			then ((stream) => {
				this.handleSuccess(stream);
			}).catch((err) => {
				console.log(err);
			});

	}

	hideVideo = (event) => {

		if(window.stream){
			window.stream.getTracks().forEach(function(track) {
				if (track.readyState == 'live') {
					track.stop();
				}
			});

			this.player.srcObject = null;
		}
	}

	componentDidMount(){

	}

	render() {
		return (
			<div>
				<div><video  ref={(player) => this.player = player} autoPlay playsInline ></video></div>
				<div><button name="showVideo" onClick={this.showVideo}>Open Camera</button><button  name="hideVideo" onClick={this.hideVideo}>Close Camera</button></div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			username: "",
			user: "",
			customState: null,
		};
	}

	
	componentDidMount(){
		//this.listenForQuestions();

		Hub.listen("auth", ({ payload: { event, data } }) => {
			switch (event) {
			case "signIn":
			  this.setState({ user: data });
			  this.setState({ username: data.signInUserSession.idToken.payload.email });
			  break;
			case "signOut":
			  this.setState({ user: null });
			  break;
			case "customOAuthState":
			  this.setState({ customState: data });
		  }
		});
	
		Auth.currentAuthenticatedUser()
		  .then(user => this.setState({ user }))
		  .catch(() => console.log("Not signed in"));
	}
	

	askForName = () => {
		return(
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Instructor LIVE! - Admin</h1>
				</header>
				<div className="">
					<center>
						<div className="username-prompt">
							<div className="username-prompt-input-container">
							<button onClick={() => Auth.federatedSignIn({provider: 'instructorlive-admin'})}>Login with Okta</button>
							</div>
						</div>
					</center>
				</div>
			</div>
		);
	}


	render() {
		if(this.state.username == ""){
			return this.askForName();	
		} else {		
			return (
				<div className="App">
					<Popup />
					<header className="App-header">
						<img src={logo} className="App-logo" alt="logo" />
						<h1 className="App-title">Instructor LIVE! {this.state.username}</h1>
					</header>
					<br />
					<VideoContent />
					<ChatContent  username={ this.state.username } />
				</div>
			);
		}
	}
}


export default App;
