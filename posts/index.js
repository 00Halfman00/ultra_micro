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

// app.get('/posts', (req, res, next) => {
//   // for development purposes, but it is not really used, otherwise
//   res.send(posts); // but this is not being used to fetch posts
// });

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title, content } = req.body;

  posts[id] = {
    id,
    title,
    content,
  };

  await axios.post('http://localhost:4005/events', {
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
  console.log('event received in post server: ', event);
  res.send({ message: 'event received. thx' });
});

app.listen(PORT, () => {
  console.log('v10');
  console.log(`post server listening on port: ${PORT}`);
});
