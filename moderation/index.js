const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const PORT = 4003;

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res, next) => {
  const { type, data } = req.body;
  console.log(
    'event received in moderation server at app.post(/events): ',
    req.body
  );

  try {
    if (type === 'COMMENT_CREATED') {
      const status = data.content.includes('foul language')
        ? 'rejected'
        : 'approved';

      await axios.post('http://event-bus-clusterip-srv:4005/events', {
        type: 'COMMENT_MODERATED',
        data: {
          id: data.id,
          postId: data.postId,
          content: data.content,
          status,
        },
      });
    }

    res.send({ message: 'event received' });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// Error handling middleware (should be defined AFTER your routes)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err); // Log the error
  res.status(500).send({ error: 'Something went wrong!' }); // Generic error response
});

app.listen(PORT, () =>
  console.log(`moderation server listening on port: ${PORT}`)
);
