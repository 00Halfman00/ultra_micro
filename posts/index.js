const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const { randomBytes } = require('crypto');
const cors = require('cors');
const PORT = 4000;

const posts = {};

app.use(bodyParser.json());
app.use(cors());

// no longer being used to get posts; this job/route is handled by the query server
// yet it can be used in postman to check if api is working via npm start/nodemon with port in this file, or using NodePort in Kubernetes with port provided when you create a service
app.get('/posts', (req, res, next) => {
  console.log('retrieving all post in post server at app.get(/posts):', posts);
  res.send(posts);
});

app.post('/posts/create', async (req, res, next) => {
  console.log(
    'creating a new post in posts server at app.post(/posts)',
    req.body
  );
  try {
    const id = randomBytes(4).toString('hex');
    const { title, content } = req.body;

    posts[id] = {
      id,
      title,
      content,
    };

    await axios.post('http://event-bus-clusterip-srv:4005/events', {
      type: 'POST_CREATED',
      data: {
        id,
        title,
        content,
      },
    });

    res.status(201).send(posts[id]);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.post('/events', (req, res, next) => {
  const event = req.body;
  console.log('event received in post server at app.posts(/events): ', event);
  res.send({ message: 'event received' });
});

// Error handling middleware (should be defined AFTER your routes)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err); // Log the error
  res.status(500).send({ error: 'Something went wrong!' }); // Generic error response
});

app.listen(PORT, () => {
  console.log(`Posts Server listening on port: ${PORT}`);
});
