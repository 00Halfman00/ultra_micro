const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const PORT = 4003;

const app = express();
app.use(bodyParser.json());

app.post('/events', (req, res, next) => {
  const { type, data } = req.body;
  console.log('in moderation server: ', req.body);
  const event = {};
  switch (type) {
    case 'COMMENT_CREATED':
      (event.type = 'COMMENT_MODERATED'),
        (event.data = {
          ...data,
          status: data.content.includes('foul language')
            ? 'rejected'
            : 'approved',
        });

      axios
        .post('http://localhost:4005/events', event)
        .catch((e) => console.error(e));
      break;
    default:
      '';
  }

  res.send({ message: 'event received' });
});

app.listen(PORT, () =>
  console.log(`moderation server listening on port: ${PORT}`)
);
