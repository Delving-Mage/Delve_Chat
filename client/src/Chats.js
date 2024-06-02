import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chats.css";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((prevMessages) => [...prevMessages, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (currentMessage.trim() === "") return;

    const messageData = {
      room: room,
      author: username,
      message: currentMessage,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", messageData);

    setMessageList((prevMessages) => [...prevMessages, messageData]);
    setCurrentMessage("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            const isYou = username === messageContent.author;
            const messageClass = isYou ? "you-message" : "other-message";
            const messageAlign = isYou ? "flex-end" : "flex-start";

            return (
              <div
                key={index}
                className={`message ${messageClass}`}
                style={{ justifyContent: messageAlign }}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
