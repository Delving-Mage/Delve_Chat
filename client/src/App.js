import io from "socket.io-client";
import { useEffect, useState } from "react";
import Chat from "./Chats";

const socket = io.connect("https://delve-chat.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Attempt to get the user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully obtained the location
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported");
    }
  }, []);

  useEffect(() => {
    // Listen for the "network_interfaces" event
    socket.on("network_interfaces", (data) => {
      console.log("Network Interfaces:", data);
    });

    return () => {
      // Clean up the event listener on component unmount
      socket.off("network_interfaces");
    };
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
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
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
