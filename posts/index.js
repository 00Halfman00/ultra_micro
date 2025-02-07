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
app.get('/posts', (req, res, next) => {
  res.send(posts);
});

app.post('/posts', async (req, res) => {
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
});

app.post('/events', (req, res, next) => {
  const event = req.body;
  console.log('event received in post server at app.posts(/events): ', event);
  res.send({ message: 'event received' });
});

app.listen(PORT, () => {
  console.log(`Posts Server listening on port: ${PORT}`);
});
