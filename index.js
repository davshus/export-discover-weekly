const express = require('express');
const fs = require('fs');
const https = require('https');
const readline = require('readline');
const chalk = require('chalk');
const opn = require('opn');
const responsePort = 1234;
const error = (str) => chalk.red(str);
const scopes = 'playlist-read-private';
var app = express();
//This application uses Spotify's implicit code flow authorization.
var tokenReceived = false;
function run(token) {
  const userInfoOptions = {
    hostname: 'api.spotify.com',
    path: '/v1/me',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  const userInfoReq = https.request(userInfoOptions, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    })
  })

  userInfoReq.on('error', (err) => console.error(error('There was an error with the user info request: %s'), e.message));
  userInfoReq.end();
}
app.get('/redir', (req, res) => {
  res.sendFile(__dirname + '/public/redir.html');
});
app.get('/auth', (req, res) => {
  if (tokenReceived) return;
  // console.log(req.query);
  if (req.query.state != state) {
    console.error(error('Fraudulent state detected from %s!'), req.hostname);
    return;
  }
  if (req.query.error) {
    console.error(error('An error occurred: %s'), req.query.error);
    process.exit(1);
  }
  console.log(chalk.green.bold('Received token authorization!'));
  // console.log(req.query);
  res.sendFile(__dirname + '/public/autoclose.html');
  tokenReceived = true;
  run(req.query.access_token);
  // app.close();
});
try {
  const clientData = JSON.parse(fs.readFileSync('./config.json').toString());
} catch (e) {
  console.error(error('Error opening %s'), e.path); return;
}
const state = Math.floor(Math.random() * Math.pow(2, 32));
const query = '?client_id=' + clientData.client_id + '&response_type=token&redirect_uri=http://localhost:' + responsePort + '/redir&state=' + state + '&scope=' + encodeURI(scopes) + '';
app.listen(responsePort, () => console.log(chalk.green.dim('Listening for OAuth token authorizaton on port', responsePort)));
console.log('Opening web browser to authorize...');
opn('https://accounts.spotify.com/authorize' + query);
