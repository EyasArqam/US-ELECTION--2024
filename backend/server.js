const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this based on your frontend origin
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Define a schema and model for your collection
const polarityDataSchema = new mongoose.Schema({}, { collection: 'PolarityData' });
const PolarityData = mongoose.model('PolarityData', polarityDataSchema);

// Set up a change stream to listen to updates in the MongoDB collection
const changeStream = PolarityData.watch();

changeStream.on('change', (change) => {
    console.log('Data change detected:', change);
    // Emit the latest data to all connected clients when there's a change
    io.emit('polarityDataUpdated', change);
});

// Define a route to get data
app.get('/api/polaritydata', async (req, res) => {
    try {
        const data = await PolarityData.find({});
        res.json(data);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Set up Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Optionally send initial data to the client
    PolarityData.find({}).then(data => socket.emit('initialPolarityData', data));

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
