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

  function descending(a, b) { return a.points < b.points ? 1 : -1; }

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
          "<div class='name'>" + players[i].name + "</div>" +
          "<div class='score'>" + players[i].points + "</div>" +
          "</li>");
          players[i].$item = $item;
          $list.append($item);
        }
      updateBoard();
    });

    ref.on('value', snapshot => {
      feedRef.orderByKey().once('value', (snap, error) => {
        snap.forEach(plSnap => {
          var pdata = plSnap.val()
          var index = players.map((o) => o.name).indexOf(pdata.name);
          var player = players[index];
          player.points = pdata['points'];
          player.$item.find(".points").text(player.points);
        });
        updateBoard();
      });
    });

  });

})();
