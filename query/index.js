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
      postByIdWithComments[data.postId].comments.push({
        id: data.id,
        content: data.content,
        status: data.status,
      });
      break;
    case 'COMMENT_UPDATED':
      const comment = postByIdWithComments[data.postId].comments.find(
        (c) => c.id === data.id
      );
      comment.status = data.status;
      comment.content = data.content;
      break;
    default:
      '';
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/posts', (req, res, next) => {
  res.send(postByIdWithComments);
});

app.post('/events', (req, res, next) => {
  console.log(
    'event received in query server at app.post(/events): ',
    req.body
  );
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send(postByIdWithComments);
});

app.listen(PORT, async () => {
  console.log(`query server listening on port: ${PORT}`);
  try {
    const res = await axios.get('http://event-bus-clusterip-srv:4005/events');

    for (let event of res.data) {
      console.log('Processing event:', event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
