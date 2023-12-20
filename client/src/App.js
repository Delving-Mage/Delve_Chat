import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chats.css";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: `${new Date(Date.now()).getHours()}:${new Date(
          Date.now()
        ).getMinutes()}`,
      };

      await socket?.emit("send_message", messageData);
      if (socket && !socket.error) {
        setMessageList((list) => [...list, messageData]);
      }
      setCurrentMessage("");
      setIsTyping(false);
      setTypingUser(null);
    }
  };
  

  const handleTyping = () => {
    if (currentMessage.trim() !== "" && !isTyping) {
      // Notify server that the user is typing
      socket.emit("typing", { room, username });
      setIsTyping(true);
      setTypingUser(username);
    } else if (currentMessage.trim() === "" && isTyping) {
      // Notify server that the user stopped typing
      socket.emit("stopped_typing", { room, username });
      setIsTyping(false);
      setTypingUser(null);
    }
  };
useEffect(() => {
  socket?.on("typing", (data) => {
    if (data.room === room && data.username !== username) {
      setIsTyping(true);
      setTypingUser(data.username);
    }
  });
});
  useEffect(() => {
    socket?.on("receive_message", (data) => {
      if (data.author !== username) {
        setMessageList((list) => [...list, data]);
      }
      setIsTyping(false);
      setTypingUser(null);
    });

    // Listen for stopped typing events from other users
    socket?.on("stopped_typing", (data) => {
      if (data.room === room && data.username !== username) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });
  }, [socket, username, room]);


  useEffect(() => {
    return () => {
      socket?.off("receive_message");
      socket?.off("typing");
      socket?.off("stopped_typing");
    };
  }, [socket]);

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
         {isTyping && typingUser !== username && (
          <div className={`typing-indicator ${typingUser === username ? 'other-typing' : 'you-typing'}`}>
          <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
            handleTyping();
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
