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
  const ref = firebase.database().ref("shows/show/currentScene");
  const feedRef = firebase.database().ref('shows/show/players/player-data')
  var players = [];

  function reposition() {
		var height = $("#leaderboard .header").height();
		var y = height;
		for(var i = 0; i < players.length; i++) {
			players[i].$item.css("top", y + "px");
			y += height;
		}
	}

  function descending(a, b) { return parseFloat(a.points) < parseFloat(b.points) ? 1 : -1; }

  function reposition() {
    console.log("repositioning");
    var height = $("#leaderboard .header").height();
		var y = height;
		for(var i = 0; i < players.length; i++) {
			players[i].$item.css("top", y + "px");
			y += height;
		}
	}

  function updateBoard() {
    console.log("updating board");
    players.sort(descending);
    console.log(players);
		updateRanks(players);
		reposition();
		}

  function updateRanks(players) {
		for(var i = 0; i < players.length; i++) {
			players[i].$item.find(".rank").text(i + 1);
		}
	}

  $(document).ready( e => {

    var $list = $("#players");
    feedRef.orderByKey().once('value', (snap, error) => {
      snap.forEach(plSnap => {
        var plyr = plSnap.val()
        plyr['number'] = +plSnap.key;
        if(!plyr.hasOwnProperty('points')){
          plyr['points'] = 0;
        }
        if(plyr['name'] != ""){
          players.push(plyr);
        }
      });

      for(var i = 0; i < players.length; i++) {
        var $item = $(
          "<li class='player'>" +
          "<div class='rank'>" + (i + 1) + "</div>" +
          "<div class='number'>" + (players[i].number) + ". </div>" +
          "<div class='name'>" + players[i].name + "</div>" +
          "<div class='points'>" + players[i].points + "</div>" +
          "</li>");
          players[i].$item = $item;
          $list.append($item);
        }
      updateBoard();
    });

    ref.on('value', snapshot => {
      feedRef.orderByChild('points').once('value', (snap, error) => {
        snap.forEach(plSnap => {
          var pdata = plSnap.val()
          var index = players.map((o) => o.number).indexOf(+plSnap.key);
          var player = players[index];
          if (pdata['points'] > 0){
            player.points = pdata['points'];
          }else{
            player.points = 0;
          }
          player.$item.find(".points").text(player.points);
        });
        updateBoard();
      });
    });

  });

})();
