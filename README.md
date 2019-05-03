# wahlins-submit
App for automatic form submission for newly added apartments at Wåhlins Fastigheter.

Uses FaunaDB to store applied apartments and Discord to send notifications. Discord is optional.

For hosting on raspberry pi and Raspian, you need to install chromium-browser:

```sudo apt install chromium-browser```

The app by default runs headless chromium. To run with gui and slow motion (default 0 ms):

```node app.js gui 250```

### Note
If the DOM tree for the 'find new apartments'-section at Wåhlins Fastigheter's web
page is updated, this app will probably stop working.
