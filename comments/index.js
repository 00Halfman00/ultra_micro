const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const PORT = 4001;
const commentsByPostsId = {};

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/posts/:id/comments', (req, res, next) => {
  console.log(
    'getting all comments in comments server at app.get(/posts/:id/comments): ',
    commentsByPostsId
  );
  const postId = req.params.id;
  res.send(commentsByPostsId[postId] || []);
});

app.post('/posts/:id/comments', async (req, res, next) => {
  console.log(
    'creating commment in comments server at app.post(/posts/:id/comments): ',
    req.body
  );
  try {
    const postId = req.params.id;
    const content = req.body.content;
    const comments = commentsByPostsId[postId] || [];
    const id = randomBytes(4).toString('hex');
    const status = 'pending';
    const comment = { id, content, status };

    comments.push(comment);
    commentsByPostsId[postId] = comments;

    const event = {
      type: 'COMMENT_CREATED',
      data: { id, postId, content, status },
    };

    await axios.post('http://event-bus-clusterip-srv:4005/events', event);

    res.status(201).send(comment);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.post('/events', async (req, res, next) => {
  console.log(
    'event received in comments server at app.post(/events): ',
    req.body
  );
  try {
    const { type, data } = req.body;
    if (type === 'COMMENT_MODERATED') {
      const comment = commentsByPostsId[data.postId].find(
        (c) => c.id === data.id
      );
      comment.status = data.status;
      const event = {
        type: 'COMMENT_UPDATED',
        data,
      };
      await axios.post('http://event-bus-clusterip-srv:4005/events', event);
    }

    res.send({ message: 'event received' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Error handling middleware (should be defined AFTER your routes)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err); // Log the error
  res.status(500).send({ error: 'Something went wrong!' }); // Generic error response
});

app.listen(PORT, () =>
  console.log(`comments server listening on port: ${4001}`)
);
