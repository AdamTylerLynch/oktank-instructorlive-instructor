import { createChatMessage, updateChatMessage } from './graphql/mutations.js';
import { onCreateChatMessage } from './graphql/subscriptions.js';
import { listChatMessages, chatMessagesByCourse } from './graphql/queries.js';
import aws_exports from './aws-exports';
import React, { Component } from 'react';
import logo from './oktanklogo.png';
import './App.css';
import JsonTable from 'ts-react-json-table';
import Popup from 'react-popup';
import Amplify, { API, graphqlOperation, formRow } from "aws-amplify";

Amplify.configure(aws_exports);

class ChatContent extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			chatMessages: [],
			inputMessage: '',
			course: 0
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
	}

	loadChatMessages = () => {
		let self = this;

		API.graphql(
			graphqlOperation(chatMessagesByCourse, { course: 0 })
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

	onSendCell = (event) => {
		if (this.state.inputMessage.length > 0) {

			const message = {
				input: {
					username: 'tlynch',
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
				<div className="controllerChat"><input type="text" name="chatMessageInput" className="textChatInput" value={this.state.inputMessage} onChange={this.handleInputChange} /><button onClick={this.onSendCell}>Send</button></div>
			</div>
		);
	}
}

class VideoContent extends React.Component {




	render() {
		return (
			<div></div>
		);
	}
}

class App extends Component {
	render() {
		return (
			<div className="App">
				<Popup />
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Instructor LIVE!</h1>
				</header>
				<br />
				<VideoContent />
				<ChatContent />
			</div>
		);
	}
}


export default App;
