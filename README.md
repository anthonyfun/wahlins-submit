# wahlins-submit
App for automatic form submission for newly added apartments at Wåhlins Fastigheter.

Uses FaunaDB to store applied apartments and Discord to send notifications. Discord is optional.

For hosting on raspberry pi and Raspian, you need to install chromium-browser:

```sudo apt install chromium-browser```

The app by default runs headless chromium. To run with gui and slow motion (default 0 ms):

```node app.js gui 250```

### Environment variables
Following environment variables (.env) is required, filled with some default stage data:

```
NAME=""

DISCORD_BOT_TOKEN=""
FAUNADB_SECRET=""
TARGET_URL=""

FIRST_NAME="Test"
LAST_NAME="Testsson"
STREET="Testvägen 7"
CITY="Teststaden"
POSTAL_CODE="12345"
TYPE="2: hand"
SOCIAL_SECURITY_NUMBER="123456789"
EMAIL="test@test.test"
PHONE="123456789"
EMPLOYER="Testium"
SALARY="999999"
NUMBER_OF_RESIDENTS="1"
```

### Note
If the DOM tree for the 'find new apartments'-section at Wåhlins Fastigheter's web
page is updated, this app will probably stop working.
