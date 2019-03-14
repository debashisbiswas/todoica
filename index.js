const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

var app = express();

app.use(express.static('views'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post("/", function (request, response) {
  console.log("Request received");
  console.log("Data: " + JSON.stringify(request.body));
  
  console.log("Calling Habitica API...");
  processHabiticaTodo(request.body.title, request.body.priority);
  console.log("Done triggering.");
  response.end();
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

function processHabiticaTodo(title, priority){
  // Make a request to Habitica using the user ID and API key from .env and the title from IFTTT
  // updated this to include priority and check off immediately
  // from the Habitica API: Difficulty, options are 0.1, 1, 1.5, 2; eqivalent of Trivial, Easy, Medium, Hard.
  // default value is 1 (easy)
  
  var theParsedPriority = 1;
  switch( priority )
  {
    case "Priority 1":
    theParsedPriority = 2;
    break;
    case "Priority 2":
    theParsedPriority = 1.5;
    break;
    case "Priority 3":
    theParsedPriority = 1;
    break;
    default:
    theParsedPriority = 1;
  }
  
  // add the task and check it off in the callback function
  request({
    headers: {
      'x-api-user': process.env.HABITICA_USER,
      'x-api-key': process.env.HABITICA_API_KEY
    },
    uri: 'https://habitica.com/api/v3/tasks/user',
    body: { text: title, type: 'todo', priority: theParsedPriority },
    json: true,
    method: 'POST'
  }, function (error, response, body) {
    console.log(`Add task reponse: ${response.statusCode}, success = ${body.success}`);
    // console.log(body);
    if(body.success)
    {
      scoreHabiticaTask(body.data._id);
    }
  });
}

function scoreHabiticaTask(taskId)
{
  // check off the task using the id
  if( taskId != 0 )
  {
    // from Habitica API: score a task with https://habitica.com/api/v3/tasks/:taskId/score/:direction
    // allowed values for direction: "up" or "down"
    var theDirection = "up";
    let theUri = `https://habitica.com/api/v3/tasks/${taskId}/score/${theDirection}`;
    request({
      headers: {
        'x-api-user': process.env.HABITICA_USER,
        'x-api-key': process.env.HABITICA_API_KEY
      },
      uri: theUri,
      json: true,
      method: 'POST'
    }, function (error, response, body) {
      console.log(`Score task reponse: ${response.statusCode}, success = ${body.success}`);
      // console.log(body);
    });
  }
}