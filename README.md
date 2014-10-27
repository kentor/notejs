## About
A [Firebase](https://www.firebase.com/) backed [Ember](http://emberjs.com/) application for storing notes. Intended for a single user only.

## Demo
http://kentor.me/notejs/public/ (open two instances side by side to see them sync updates in real time).

<p align="center">
  <img src="http://i.imgur.com/buwmSol.png" />
</p>

## To create your own
- Fork the project.
- Run `npm install`.
- Register a [Firebase](https://www.firebase.com/) account and create an app.
- In `public/js/main.js` replace `App.firebaseRef = new Firebase('https://selfnote.firebaseio.com');` with the location of your firebase app.
- If you don't need authentication, set `App.authRequired = false`.
- If you do need authentication, you need to set up simple auth on your firebase app. In your firebase app dashboard, go to "Simple Login" and then follow their instructions to set up "Authentication Providers".
- In `main.js` replace the `twitter` in `App.firebaseRef.authWithOAuthRedirect('twitter', Ember.K);` with the provider of your choice.
- In your firebase "Security Rules" tab, set up your security rules to allow a specific user to read/write. An example:

    ```
    {
        "rules": {
            ".read": "auth.uid == 'twitter:12345678'",
            ".write": "auth.uid == 'twitter:12345678'"
        }
    }
    ```

    If you don't know what to put in place of `twitter:12345678`, you can find out by logging in with your app and then checking `App.user` in the console for the `uid` property.
- Be sure to run `gulp watch` to see the changes, and `gulp build` before deploying.
- You can host the built project on heroku as a simple rack application. Or you can just host the `public/` folder at any static web hosting provider like [neocities](https://neocities.org/).

## Bookmarklet
The [bookmarklet](bookmarklet.js) can be used to post a note whose content is `window.location.href`, the url of the page you're viewing.
Just replace `<FIREBASE_URL>` with your firebase app url and `<FIREBASE_SECRET>` with one of your firebase secrets.
I recommend minifying the bookmarklet with `uglifyjs bookmarklet.js -cm`.
Be sure to add `javascript:` before the script to make it a valid bookmarklet.
Sites with a `Content-Security-Policy` header may block the script from making an xhr request to firebase so this won't work on every site.

## License
Licensed under the [MIT license](LICENSE.txt).
