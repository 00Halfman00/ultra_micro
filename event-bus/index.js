const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const PORT = 4005;

const app = express();
app.use(bodyParser.json());

const events = []; // keep record of events in case some other server goes down: restart querry server and get all events stored from bus server

app.post('/events', async (req, res, next) => {
  const event = req.body;
  events.push(event);
  console.log('event received in bus server at app.posts(/events): ', event);

  await axios
    .post('http://posts-clusterip-srv:4000/events', event) // posts server
    .catch((e) => console.error(e));
  await axios
    .post('http://comments-clusterip-srv:4001/events', event) // comments server
    .catch((e) => console.error(e));
  await axios
    .post('http://query-clusterip-srv:4002/events', event) // query server
    .catch((e) => console.error(e));
  await axios
    .post('http://moderation-clusterip-srv:4003/events', event) // moderation server
    .then((res) =>
      console.log('full event response: ', JSON.stringify(res, null, 2))
    )
    .catch((e) => console.error(e));

  res.send({ message: 'event received' }); // Send response after all posts complete
});

app.get('/events', (req, res, next) => {
  console.log(
    'events database in Bus Server is being accessed by route app.get(/events): ',
    events
  );
  res.send(events);
});

app.listen(PORT, () => {
  console.log(`Bus Server listening on port: ${PORT}`);
});

/*
  app.post('/events', async (req, res, next) => {
  const event = req.body;
  events.push(event);
  console.log('event received in bus server at app.posts(/events): ', event);
Why This Is Better (using async/await and Promise.all):
1.  Cleaner Code:
    async/await makes asynchronous code look and behave a lot more like synchronous code,
    making it easier to read and understand.
2.  Improved Error Handling:
    The try...catch block makes error handling much more robust.
    You now properly handle potential errors from all the axios.post calls.
3.  Correct Response Timing:
    The await keyword ensures that the response (res.send(...)) is sent
    after all the POST requests have completed (or an error has occurred). In your original code,
    the .then() block was executed even if some of the requests had failed (because the .catch handlers
    were only logging the error, not rejecting the Promise).

try {
  await Promise.all([
    axios.post('http://localhost:4000/events', event), // posts server
    axios.post('http://localhost:4001/events', event), // comments server
    axios.post('http://localhost:4002/events', event), // query server
    axios.post('http://localhost:4003/events', event), // moderation server
  ]);
  res.send({ message: 'event received' }); // Send response after all posts complete
} catch (error) {
  console.error('Error sending event:', error);
  next(error); // Pass the error to the Express error middleware
  // OR, if you want to send a specific error response:
  //res.status(500).send({ error: 'Failed to process event' });
}
});

// Error handling middleware (should be defined AFTER your routes)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err); // Log the error
  res.status(500).send({ error: 'Something went wrong!' }); // Generic error response
});
*/
