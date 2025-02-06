const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const PORT = 4001;

/*
  NOTE: The comments server will send to "storage" (a database, eventually) only comment's info;
        that is, it will send to storage an object containing the post id associated with a comment,
        comment id, and comment content. It will not store a record of the post that are
        associated with the comment/s.
*/

const commentsByPostsId = {};

app.use(cors());
app.use(bodyParser.json());

app.get('/posts/:id/comments', (req, res, next) => {
  const postId = req.params.id;
  res.send(commentsByPostsId[postId] || []);
});

app.post('/posts/:id/comments', async (req, res, next) => {
  console.log('in comments server: ', req.body);
  const postId = req.params.id;
  const content = req.body.content;
  const comments = commentsByPostsId[postId] || [];
  const id = randomBytes(4).toString('hex');
  const status = 'pending';
  const comment = { id, content, status };
  comments[comments.length] = comment;
  commentsByPostsId[postId] = comments;

  const event = {
    type: 'COMMENT_CREATED',
    data: { postId, id, content, status },
  };

  await axios
    .post('http://localhost:4005/events', event)
    .catch((e) => console.error(e));

  res.status(201).send(comment);
});

app.post('/events', async (req, res, next) => {
  const { type, data } = req.body;
  console.log('event received in comments server: ', req.body);
  switch (type) {
    case 'COMMENT_MODERATED':
      const comment = commentsByPostsId[data.postId].find(
        (c) => c.id === data.id
      );
      comment.status = data.status;
      const event = {
        type: 'COMMENT_UPDATED',
        data,
      };
      await axios
        .post('http://localhost:4005/events', event)
        .catch((e) => console.error(e));
  }

  res.send({ message: 'event received. thx' });
});

app.listen(PORT, () =>
  console.log(`comments server listening on port: ${4001}`)
);
