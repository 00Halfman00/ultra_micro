const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const PORT = 4002;
const postByIdWithComments = {};

const app = express();
app.use(cors());
app.use(bodyParser.json());

///////////////////////////////////////////   helper funciton  /////////////////////////////////////
const handleEvent = (type, data) => {
  switch (type) {
    case 'POST_CREATED':
      postByIdWithComments[data.id] = {
        id: data.id,
        title: data.title,
        content: data.content,
        comments: [],
      };
      break;
    case 'COMMENT_CREATED':
      postByIdWithComments[data.postId].comments.push(data);
      break;
    case 'COMMENT_UPDATED':
      const comment = postByIdWithComments[data.postId].comments.find(
        (c) => c.id === data.id
      );
      comment.status = data.status;
      comment.content = data.content;
    default:
      '';
  }
  console.log('in handle event: ', postByIdWithComments);
};
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/posts', (req, res, next) => {
  res.send(postByIdWithComments);
});

app.post('/events', (req, res, next) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  console.log(
    'event received in query server at app.posts(/events):',
    req.body
  );

  res.send(postByIdWithComments);
});

app.listen(PORT, async () => {
  try {
    const res = await axios.get('http://localhost:4005/events');

    for (let event of res.data) {
      console.log('Processing event:', event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }

  console.log(`query server listening on port: ${PORT}`);
});
