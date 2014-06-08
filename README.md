## About
A [Firebase](https://www.firebase.com/) backed [Ember](http://emberjs.com/) application for storing notes. Intended for a single user only.

## Demo
http://kentor.me/notejs/public/ (open two instances to see them sync updates in real time).

## To create your own
- Fork the project.
- Register a [Firebase](https://www.firebase.com/) account and create an app.
- In `public/js/main.js` replace `App.firebaseRef = new Firebase('https://selfnote.firebaseio.com');` with the location of your firebase app.
- If you don't need authentication, check out the `gh-pages` branch which has commented out some code in `main.js` that disables authentication checking.
- If you do need authentication, you need to set up simple auth on your firebase app. In your firebase app dashboard, go to "Simple Login" and then follow their instructions to set up "Authentication Providers".
- In `main.js` replace the `twitter` in `App.auth.login('twitter', { preferRedirect: true, rememberMe: true });` with the provider of your choice.
- In your firebase "Security Rules" tab, setup your security rules to allow a specific user to read/write. An example:

    ```
    {
        "rules": {
            ".read": "auth.uid == 'twitter:12345678'",
            ".write": "auth.uid == 'twitter:12345678'"
        }
    }
    ```

    If you don't what to put in place of `twitter:12345678`, you can find out but logging in with this app and then checking `Auth.user` in the console to get the `uid`.
- You can host the project on heroku as a simple rack application. Or you can just host the `public/` folder at any static web hosting provider like [neocities](https://neocities.org/).

## License
Licensed under the [MIT license](LICENSE.txt).
