import React, { useState, useRef, useEffect } from "react";

const socket = new WebSocket("ws://localhost:8080");

export default function App() {
	const [messages, setMessages] = useState([
		{ id: 1, text: "Hello!", sender: "other" },
		{ id: 2, text: "Hey 👋", sender: "me" },
	]);

	const [input, setInput] = useState("");
	const messagesEndRef = useRef(null);

	useEffect(() => {
		socket.onopen = () => {
			console.log("Connected to server");
		};
	}, []);

	useEffect(() => {
		socket.onmessage = (event) => {
			setMessages((prev) => [...prev, { id: Date.now(), text: event.data, sender: "other" }]);
		};
	}, []);

	useEffect(() => {
		socket.onclose = () => {
			console.log("Disconnected from server");
		};
	}, []);

	const sendMessage = () => {
		if (!input.trim()) return;

		const newMessage = {
			id: Date.now(),
			text: input,
			sender: "me",
		};

		setMessages((prev) => [...prev, newMessage]);
		setInput("");

		socket.send(input);
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div style={styles.container}>
			<div style={styles.chatContainer}>
				<div style={styles.header}>Chat</div>

				<div style={styles.messages}>
					{messages.map((msg) => (
						<div
							key={msg.id}
							style={{
								...styles.messageBubble,
								...(msg.sender === "me" ? styles.myMessage : styles.otherMessage),
							}}>
							{msg.text}
						</div>
					))}

					<div ref={messagesEndRef} />
				</div>

				<div style={styles.inputArea}>
					<input
						style={styles.input}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
						onKeyDown={(e) => {
							if (e.key === "Enter") sendMessage();
						}}
					/>

					<button style={styles.sendButton} onClick={sendMessage}>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100vh",
		background: "#f5f5f5",
		fontFamily: "Arial",
	},

	chatContainer: {
		width: "400px",
		height: "600px",
		background: "white",
		borderRadius: "10px",
		display: "flex",
		flexDirection: "column",
		boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
	},

	header: {
		padding: "15px",
		borderBottom: "1px solid #eee",
		fontWeight: "bold",
	},

	messages: {
		flex: 1,
		overflowY: "auto",
		padding: "15px",
		display: "flex",
		flexDirection: "column",
		gap: "10px",
	},

	messageBubble: {
		padding: "10px 14px",
		borderRadius: "15px",
		maxWidth: "70%",
	},

	myMessage: {
		background: "#4CAF50",
		color: "white",
		alignSelf: "flex-end",
	},

	otherMessage: {
		background: "#e5e5ea",
		alignSelf: "flex-start",
	},

	inputArea: {
		display: "flex",
		borderTop: "1px solid #eee",
		padding: "10px",
	},

	input: {
		flex: 1,
		padding: "10px",
		borderRadius: "8px",
		border: "1px solid #ccc",
	},

	sendButton: {
		marginLeft: "10px",
		padding: "10px 16px",
		borderRadius: "8px",
		border: "none",
		background: "#4CAF50",
		color: "white",
		cursor: "pointer",
	},
};
