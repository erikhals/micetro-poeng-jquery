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
  const crRef = firebase.database().ref("shows/show/currentRound");
  const pdataRef = firebase.database().ref('shows/show/players/player-data')
  var players = [];


  function descending(a, b) { return parseFloat(a.points) < parseFloat(b.points) ? 1 : -1; }

  function reposition() {
    var height = $("#leaderboard .header").height();
		var y = height;
		for(var i = 0, j=players.length; i < j; i++) {
			players[i].$item.css("top", y + "px");
			y += height;
		}
	}

  function animateBoard(){
    var delay = 100;
    var y = 300;
    for(var i = 0; i < players.length; i++) {
        (function(index){setTimeout(() =>{
          players[index].$item.addClass("animated flipInX");
        }, y);
        })(i);
			y += delay;
		};
  }

  function updateBoard() {
    players.sort(descending);
		updateRanks(players);
		reposition();
	}

  function updateRanks(players) {
		for(var i = 0; i < players.length; i++) {
			players[i].rank = (i + 1);
		}
	}

  $(document).ready( e => {

    var $list = $("#players");
    pdataRef.orderByKey().once('value', (snap, error) => {
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
          "<div class='number'>" + (players[i].number) + ". </div>" +
          "<div class='name'>" + players[i].name + "</div>" +
          "<div class='changes'></div>" +
          "<div class='points'>" + players[i].points + "</div>" +
          "</li>");
          players[i].$item = $item;
          players[i].$item.find(".changes").css("opacity","1.0");
          $list.append($item);
        }
      animateBoard();
    }).then(() => {

      pdataRef.orderByChild('points').on('value', (snap, error) => {
        snap.forEach(plSnap => {
          var pdata = plSnap.val()
          var index = players.map((o) => o.number).indexOf(+plSnap.key);
          var player = players[index];
          if (pdata['points'] > 0){
            player.diff = pdata['points'] - player.points;
            player.points = pdata['points'];
          }else{
            player.points = 0;
          }
          if (player.diff > 0){
            player.$item.find(".changes").text("+"+player.diff);
            player.$item.find(".changes").css("opacity","0.2");
          }
          if (!pdata.hasOwnProperty("active")){
            player.eliminated = true;
            player.$item.css("opacity","0.5");
          }
          player.$item.find(".points").text(player.points);
        });

        updateBoard();
        $('#leaderboard').find(".header").addClass('animated fadeIn');
      });
      crRef.on('value', snapshot => {
        for(var i = 0; i < players.length; i++) {
    			players[i].$item.find(".changes").text("").css("opacity","1");
    		}

      });
    });



  });

})();
