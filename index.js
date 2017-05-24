'use strict';
const express = require('express');
const fs = require('fs');
const https = require('https');
const readline = require('readline');
const chalk = require('chalk');
const opn = require('opn');
const rpn = require('request-promise-native');
const responsePort = 1234;
const error = chalk.red, note = chalk.green.dim, success = chalk.green.bold;
const scopes = 'playlist-read-private playlist-modify-public playlist-modify-private';
var app = express();
//This application uses Spotify's implicit code flow authorization.
var tokenReceived = false;
var clientData;
const playlistName = 'DW 5/22/17';
try {
  clientData = JSON.parse(fs.readFileSync('./config.json').toString());
} catch (e) {
  console.error(error('Error opening %s'), e.path); return;
}
const state = Math.floor(Math.random() * Math.pow(2, 32));
const query = '?client_id=' + clientData.client_id + '&response_type=token&redirect_uri=http://localhost:' + responsePort + '/redir&state=' + state + '&scope=' + encodeURI(scopes) + '';
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
  console.log(success('Received token authorization!'));
  // console.log(req.query);
  res.sendFile(__dirname + '/public/autoclose.html');
  tokenReceived = true;
  let token = req.query.access_token;
  // console.log(token);
  let DWhref, id;
  getMyInfo(token)
    .then(info => {
      console.log(note('Accessed user info to obtain user id...'));
      return createPlaylist(token, playlistName, JSON.parse(info).id);
    })
    .then(href => {
      console.log(note('Created playlist ' + playlistName + '...'));
      DWhref = href.href;
      return getMyPlaylists(token);
    })
    .then(playlists => {
      console.log(note('Received user playlists...'));
      return getTracksOfPlaylist(token, filterDW(JSON.parse(playlists).items).href);
    })
    .then(tracks => {
      console.log(note('Received Discovery Weekly tracks...'));
      return addTracksToPlaylist(token, DWhref, JSON.parse(tracks).items.map(item => item.track.uri));
    })
    .then(res => {
      console.log(success('Done! :D'));
      console.log(success('Exiting...\n'));
      process.exit(0);
    })
    .catch(err => {
      console.log(error(err));
      console.log(error('Exiting...\n'));
      process.exit(1);
    });
  // app.close();
});
app.listen(responsePort, () => console.log(note('Listening for OAuth token authorizaton on port', responsePort)));
console.log(note('Opening web browser to authorize...'));
opn('https://accounts.spotify.com/authorize' + query);
// function getID(token) {
//   const userInfoOptions = {
//     hostname: 'api.spotify.com',
//     path: '/v1/me',
//     method: 'GET',
//     headers: {
//       'Authorization': 'Bearer ' + token
//     }
//   };
//   // console.log(userInfoOptions.headers['Authorization']);
//   const userInfoReq = https.request(userInfoOptions, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     res.on('data', (chunk) => {
//       console.log(`BODY: ${chunk}`);
//     })
//   })
//   userInfoReq.on('error', (err) => console.error(error('There was an error with the user info request: %s'), e.message));
//   userInfoReq.end();
// }
function getMyInfo(token) {
  let options = {
    uri: 'https://api.spotify.com/v1/me',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return rpn(options);
};
function getMyPlaylists(token) {
  let options = {
    uri: 'https://api.spotify.com/v1/me/playlists',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return rpn(options);
};
var filterDW = (playlists) => playlists.filter((element, index, array) => element.name == "Discover Weekly")[0];
function getTracksOfPlaylist(token, href) {
  let options = {
    uri: href + '/tracks',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return rpn(options);
};
function createPlaylist(token, name, id) {
  let options = {
    uri: 'https://api.spotify.com/v1/users/' + id + '/playlists',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: {
      name: name
    },
    json: true
  };
  return rpn(options);
};
function addTracksToPlaylist(token, href, tracks) {
  let options = {
    uri: href + '/tracks',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: {
      uris: tracks
    },
    json: true
  };
  return rpn(options);
};