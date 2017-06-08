# Export Discover Weekly
Spotify makes a playlist every week called "Discover Weekly" and it's awesome - but it's deleted every week.

Every single week.

This is an application to learn about OAuth and RESTful APIs and backup Spotify's awesome recommendations.

## Setup

To use this script, you need to set up your own Spotify app.

Go to [Spotify's developer console](https://developer.spotify.com) and click My Apps.  Set up an app with any title or description, preferably something pertaining to the actual function of the app.

In the "Authorized Callbacks" section or something that looks like that phrasing, add `localhost:1234/redir`.

After downloading the project using `$ git clone https://github.com/davshus/export-discover-weekly` enter the folder using `cd export-discover-weekly`.

Make a file called `config.json`, and copy the following format, filling in the information from your Spotify app's website as needed.

```json
{
  "client_id": "PUT YOUR CLIENT ID HERE!",
  "client_secret": "PUT YOUR CLIENT SECRET HERE!"
}
```

Now, you should be set up.

## Installation

In your command prompt/terminal, run `$ npm install` while in the correct directory.


## Execution

Run `$ node .` while in the correct directory.
