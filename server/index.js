const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const os = require("os");
const bodyParser = require("body-parser"); // Added this import

app.use(cors());
app.use(bodyParser.json()); // Added this middleware
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://delvingmage.netlify.app",
    methods: ["GET", "POST"],
  },
});

const typingUsers = {};
const twilioAccountSid = 'AC6b19bc78b294ab1d2238b7ff3293085b'; // Use environment variable
const twilioAuthToken = 'c67f77de8d5785b8cab2d81cfcb98a3f'; // Use environment variable
const twilioPhoneNumber = '+14155238886';
const client = require("twilio")(twilioAccountSid, twilioAuthToken);

// Twilio credentials
// const accountSid = 'AC6b19bc78b294ab1d2238b7ff3293085b';
// const authToken = 'c67f77de8d5785b8cab2d81cfcb98a3f';
io.on("connection", (socket) => {
  console.log(`User Connectedd: ${socket.id}`);
  socket.emit("network_interfaces", os.networkInterfaces());

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });
  socket.on("send_message", async (data) => {
    // Notify other users through sockets
    socket.to(data.room).emit("receive_message", data);

    // Notify the sender as well
    socket.emit("receive_message", data);

    // Notify other users that the sender is not typing anymore
    delete typingUsers[socket.id];
    io.to(data.room).emit("stopped_typing", { username: data.author });

    // Send WhatsApp message using Twilio
    try {
      await client.messages.create({
        body: `New message from ${data.author}: ${data.message}`,
        from: `whatsapp:${twilioPhoneNumber}`,
        to: '+916362221839', // Replace with the recipient's WhatsApp number
      });

      console.log('Twilio Message Sent Successfully!');
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.message);
    }
  });


  socket.on("typing", (data) => {
    typingUsers[socket.id] = { username: data.username };
    io.to(data.room).emit("typing", { username: data.username });
  });

  socket.on("disconnect", () => {
    // Notify other users that the disconnected user is not typing anymore
    if (typingUsers[socket.id]) {
      io.to(typingUsers[socket.id].room).emit("stopped_typing", {
        username: typingUsers[socket.id].username,
      });
      delete typingUsers[socket.id];
    }

    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
