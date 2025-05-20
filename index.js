const config = require('config');

// Startup check for jwtPrivateKey
if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

const mongoose = require('mongoose');
const express = require('express');
const loansRouter = require('./routes/loans');
const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const usersRouter = require('./routes/users'); // Added users router
const authRouter = require('./routes/auth'); // Added auth router
const returnsRouter = require('./routes/returns'); // Added returns router
const agentsRouter = require('./routes/agents'); // Added agents router

const app = express();

// Connect to MongoDB
const db = config.get('db');
mongoose.connect(db)
    .then(() => console.log(`Connected to MongoDB: ${db}`))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Middleware
app.use(express.json());

// Mount routers
app.use('/api/loans', loansRouter);
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/users', usersRouter); // Mounted users router
app.use('/api/auth', authRouter); // Mounted auth router
app.use('/api/returns', returnsRouter); // Mounted returns router
app.use('/api/agents', agentsRouter); // Mounted agents router

const port = process.env.PORT || config.get("port");

const server = app.listen(port, () => {
    console.log(`Server listening for requests on port ${port}`);
});

module.exports = server;
