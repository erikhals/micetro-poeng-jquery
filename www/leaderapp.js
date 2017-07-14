(function(){
  var config = {
    apiKey: "AIzaSyDA3OKvkpat-9LFYSG0GnfY2xrfpLmz4aE",
    authDomain: "micetro-poeng.firebaseapp.com",
    databaseURL: "https://micetro-poeng.firebaseio.com",
    projectId: "micetro-poeng",
    storageBucket: "micetro-poeng.appspot.com",
    messagingSenderId: "38039570025"
  };

  firebase.initializeApp(config);

  //get elements
  const passWd = $('#userPassword');
  const btnLogIn = $('#btnLogIn');

  //Add login event
  btnLogIn.on('click', e => {
    //Get email and password
    const email = "erikhals@gmail.com";
    const password = passWd.val();
    const auth = firebase.auth();
    //Log in
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user){
      window.location = 'leaderboard.html#board';

    })
    .catch(function(error) {

      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + errorMessage);
      // ...
    });
  });

  //Add realtime listener
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser){
      console.log(firebaseUser);
    }
    else{
      console.log('not logged in');
      window.location = 'leaderboard.html#page1';
    }
  });

  var ref = firebase.database().ref("shows/show/currentScene");

  $('#board').on('pagecreate', e => {
    ref.on('value', e => {

      const feedRef = firebase.database().ref('shows/show/players/player-data')
      var feed = [];
      feedRef.orderByKey().once('value', (snap, error) => {
        var allItems = '';
        snap.forEach(plSnap => {
          const plyr = plSnap.val()
          plyr['number'] = +plSnap.key;
          if(!plyr.hasOwnProperty('points')){
            plyr['points'] = 0;
          }
          if(plyr['name'] != ""){
            feed.push(plyr);
          }
        });

        feed.sort((a,b) => {
          return parseFloat(b.points) - parseFloat(a.points);
        });

        for(var i=0; i<feed.length; i++){
          allItems += '<li data-rowid="' + feed[i].number + '" ><span style="float:left">' + feed[i].number +'. ' + feed[i].name + '</span><span style="float:right">'+feed[i].points+' poeng</span></li>';
        };
        console.log("appending");
        $("#scoresList").empty().append(allItems).listview().listview("refresh");
      });
    });
  });
})();
