import io from "socket.io-client";
import { useEffect, useState } from "react";
import Chat from "./Chats";

const socket = io.connect("https://delve-chat.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeUrl1, setIframeUrl1] = useState("");

  const joinRoom = () => {
    // Generate a random username if none is provided
    const randomUsername = `User${Math.floor(Math.random() * 1000)}`;
    setUsername(username || randomUsername);

    if (room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const getRoomShareLink = () => {
    if (room !== "") {
      // Construct the shareable link
      return `${window.location.origin}?room=${room}`;
    }
    return "";
  };

  const handleShare = async () => {
    const shareData = {
      title: "Join my chat room",
      text: `Join my chat room with room ID ${room}`,
      url: getRoomShareLink(),
    };

    try {
      await navigator.share(shareData);
      console.log("Successfully shared");
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback for unsupported platforms
      alert("Sharing is not supported on this platform.");
    }
  };

  const handleIframeUrlChange = (event) => {
    setIframeUrl(event.target.value);
    socket.emit("iframe_url", { room, url: event.target.value });
  };
  const handleIframeUrlChange1 = (event) => {
    setIframeUrl1(event.target.value);
    socket.emit("iframe_url", { room, url: event.target.value });
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>
          <input
            type="text"
            placeholder="John..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join A Room</button>
          {userLocation && (
            <p>
              Your current location: {userLocation.latitude}, {userLocation.longitude}
            </p>
          )}
          <button onClick={handleShare}>Share</button>
        </div>
      ) : (
        <div style={{display:"flex"}}>
          <div className="iframe-container">
            <input
              type="text"
              placeholder="Enter website URL..."
              value={iframeUrl}
              onChange={handleIframeUrlChange}
            />
            <iframe
              src={iframeUrl}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Embedded Website"
            ></iframe>
          </div>
          <Chat socket={socket} username={username} room={room} />
          <div className="iframe-container">
            <input
              type="text"
              placeholder="Enter website URL..."
              value={iframeUrl1}
              onChange={handleIframeUrlChange1}
            />
            <iframe
              src={iframeUrl1}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Embedded Website"
            ></iframe>
          </div>
        </div>
      )}
    </div>
);
}

export default App;
