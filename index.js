// Import express and request modules
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser')
require('dotenv').config()

var clientId = process.env.SLACK_CLIENT_ID;
var clientSecret = process.env.SLACK_CLIENT_SECRET;
var jiraAuth = process.env.JIRA_AUTH;

// Instantiates Express and assigns our app variable to it
var app = express();

// define a port to listen to
const port=process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Lets start our server
app.listen(port, function () {
    //Callback triggered when server is successfully listening
    console.log("Example app listening on port " + port);
});


// This route handles GET requests to our root ngrok address and responds with "Ngrok is working"
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

// This route handles get request to a /oauth endpoint. 
app.get('/oauth', function(req, res) {
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code 
        request({
            url: 'https://slack.com/api/oauth.access', 
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, 
            method: 'GET', 

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);

            }
        })
    }
});

// Route the endpoint that our slash command will point to 
app.post('/safe', function(req, res) {
    var slackData = req.body;
    var text = slackData.text;
    var user = slackData.user_name;

    var jiraData = {
        "fields": {
            "project" : {
                "key": "SAFE"
            }, 
            "issuetype" : {
                "name": "SWRE"
            }, 
            "summary" : text, 
            "description" : text + "\n Reported by: " + user + "6river.com",
            "priority" : {
                "name": "Severity 1"
            }
        }
    }

    var options = {
        method: 'POST',
        url: 'https://6river.atlassian.net/rest/api/2/issue',
        auth: { username: 'sprematilleke@6river.com', password: jiraAuth },
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: jiraData,
        json: true
    }

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(
            'Response: ' + response.statusCode + ' ' + response.statusMessage
        );
        console.log(body);
    }); 

    res.json({response_type : 'in_channel'});
});