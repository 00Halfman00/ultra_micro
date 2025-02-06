const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const PORT = 4005;

const app = express();
app.use(bodyParser.json());

const events = []; // keep record of events in case some other server goes down: restart querry server and get all events stored from bus server

app.post('/events', (req, res, next) => {
  const event = req.body;
  events.push(event);
  console.log('event received in bus server: ', event);
  Promise.all([
    // Use Promise.all for concurrent requests
    axios
      .post('http://localhost:4000/events', event)
      .catch((e) => console.error('Post Server Error:', e.message)),
    axios
      .post('http://localhost:4001/events', event)
      .catch((e) => console.error('Comments Server Error:', e.message)),
    axios
      .post('http://localhost:4002/events', event)
      .catch((e) => console.error('Query Server Error:', e.message)),
    axios
      .post('http://localhost:4003/events', event)
      .catch((e) => console.error('Moderation Server Error:', e.message)),
  ]).then(() => res.send({ message: 'event received' })); // Send response after all posts complete
});

app.get('/events', (req, res, next) => {
  res.send(events);
});

app.listen(PORT, () => {
  console.log(`bus server listening on port: ${PORT}`);
});
