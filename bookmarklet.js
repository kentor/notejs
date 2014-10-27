!function() {
  var data = JSON.stringify({
    "content": window.location.href,
    "createdAt": new Date(),
    "hidden": false,
  });

  var xhr = new XMLHttpRequest();

  xhr.open('post', 'https://<FIREBASE_URL>.firebaseio.com/notes.json?auth=<FIREBASE_SECRET>');

  xhr.setRequestHeader('Connection', 'close');
  xhr.setRequestHeader('Content-length', data.length);
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

  xhr.send(data);
}();

/* uglify bookmarklet.js -cm
javascript:!function(){var e=JSON.stringify({content:window.location.href,createdAt:new Date,hidden:!1}),t=new XMLHttpRequest;t.open("post","https://<FIREBASE_URL>.firebaseio.com/notes.json?auth=<FIREBASE_SECRET>"),t.setRequestHeader("Connection","close"),t.setRequestHeader("Content-length",e.length),t.setRequestHeader("Content-type","application/json; charset=utf-8"),t.send(e)}()
*/
