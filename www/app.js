(function () {
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
  const passWd = document.getElementById('passWd');
  const btnLogIn = document.getElementById('btnLogIn');

  const csRef = firebase.database().ref("shows/show/currentScene");
  var currentScene;

  // CurrentRound variable
  const crRef = firebase.database().ref("shows/show/currentRound");
  var currentRound;

  //Add login event
  btnLogIn.addEventListener('click', e => {
    //Get email and password
    const email = "erikhals@gmail.com";
    const password = passWd.value;
    const auth = firebase.auth();
    //Log in
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user){
      window.location = 'index.html#mainMenu';

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
      window.location = 'index.html#page1';
    }
  });

  // CurrentScene variable
  csRef.on('value', csnap => {
    currentScene = csnap.val();
    console.log(currentScene);
  });

  crRef.on('value', crsnap => {
    currentRound = crsnap.val();
    console.log(currentRound);
  });

  var cPlayRef = firebase.database().ref("shows/show/players/player-list")
  var currentPlayers;
  var currentActive;
  cPlayRef.on('value', psnap => {
    currentPlayers = psnap.numChildren();
    currentActive = 0;
    psnap.forEach(snapchild => {
      if (snapchild.val()==true){
        currentActive++;
      };
    });
  });

  // Log out button
  $(".logOut").click( function() {
    firebase.auth().signOut().then(e => {
      // Sign-out successful.
      window.location = 'index.html#page1';
    } , function(error) {
      // An error happened.
      console.log("Error with sign out");
    });
  });

  //hide elimination button
  $('#showMenu').on("pagebeforeshow", e => {
    $('#btnElimination').closest('.ui-btn').hide();
    cPlayRef.once('value', psnap => {
      currentPlayers = psnap.numChildren();
      currentActive = 0;
      var winner;
      psnap.forEach(snapchild => {
        if (snapchild.val()==true){
          currentActive++;
          winner = snapchild.key;
        };
      });
      if (currentActive == 0 && currentPlayers > 1){
        $('#btnElimination').closest('.ui-btn').show();
        $('#btnNewScene').closest('.ui-btn').hide();
        $("#showInfo").html("<h3>Round "+currentRound+" - Scene "+currentScene+"</h3>");
      }else if(currentPlayers == 1){
        $('#btnNewScene').closest('.ui-btn').hide();
        $('#btnElimination').closest('.ui-btn').hide();
        $("#showInfo").html("<h3>Kveldens Micetro er Spiller "+winner+"</h3>");
      }else{
        $('#btnElimination').closest('.ui-btn').hide();
        $('#btnNewScene').closest('.ui-btn').show();
        $("#showInfo").html("<h3>Round "+currentRound+" - Scene "+currentScene+"</h3>");
      }
    });

  });

  $('#mainMenu').on("pagebeforeshow", () => {
    csRef.once('value', csnap => {
      currentScene = csnap.val();
    }).then(()=>{
      $("#btnContinue").closest('.ui-btn').hide();
      $("#btnNewShow").closest('.ui-btn').hide();

      if(currentScene == null){
        $("#btnContinue").closest('.ui-btn').hide();
        $("#btnNewShow").closest('.ui-btn').show();
      }else{
        $("#btnContinue").closest('.ui-btn').show();
        $("#btnNewShow").closest('.ui-btn').show();
      }
    });

  });

  $('#btnContinue').on('click', e => {
    window.location = '#showMenu';
  });


  // Set player names
  $('#playerInput').submit(event => {
    var $form = $(this);
    var players = "shows/show/players";
    var data = [];
    var ref = firebase.database().ref(players);
    //Get all player names and set the data in Firebase
    for (i=1;i<14;i++){
      var playerSend = $("#player"+i).val();
      playeri= i;
      if(!playerSend && currentScene == 1){
        ref.child("player-list").child(playeri).remove();
        ref.child("player-data/" + playeri + "/active").remove();
        $('#checkbox'+i).checkboxradio().checkboxradio( "option", "disabled", true );
        $('#checkbox'+i).closest('div').addClass('mobile-checkboxradio-disabled');
      }else if(currentScene == 1){
        ref.child("player-data").child(playeri).child("name").set(playerSend);
        ref.child("player-list").child(playeri).set(true);
        ref.child("player-data").child(playeri).child("active").set(true);
        $('#checkbox'+i).closest("div").removeClass('ui-state-disabled');
      }else{
        ref.child("player-data").child(playeri).child("name").set(playerSend);
      };
    };
    window.location = '#showMenu';
    return false;
  });

  $('#scenePage').on("create", e => {
    var ref = firebase.database().ref('shows/show/players/player-data');
    ref.once("value").then(snapshot => {
      //Enable button 13 if player 13 has a name
      if(snapshot.child("13").child("name").val() == null){
        $("#knapp13").hide();
      }else{
        $("#knapp13").show();
      }
      for (i=1; i<14; i++) {
        $('#checkbox'+i).checkboxradio().checkboxradio( "option", "disabled", true );
        $('#checkbox'+i).closest('div').addClass('mobile-checkboxradio-disabled');
      };
      snapshot.forEach(childSnap => {
        var childval = childSnap.child("active").val();
        if (childval == true){
          $('#checkbox'+childSnap.key).checkboxradio().checkboxradio( "option", "disabled", false );
          $('#checkbox'+childSnap.key).closest("div").removeClass('mobile-checkboxradio-disabled');
        }
      });
      for (i=1; i<14; i++) {
        $('#checkbox'+i).checkboxradio().checkboxradio("refresh");
      };
    });
  });

  $("#btnNewScene").on('click', e => {
    $('#sceneInput')[0].reset();
    for(var i=1;i<=13;i++){
      $('#checkbox'+i).checkboxradio().checkboxradio("refresh");
    };
    $('#sceneHeader').html("Scene " + currentScene);
    window.location = '#scenePage';
  });


  $("#btnElimination").on('click', e => {
    const feedRef = firebase.database().ref('shows/show/players/player-data')
    var feed = [];
    feedRef.orderByKey().once('value', (snaps, error) => {
      var allItems = '';
      snaps.forEach(plSnap => {
        const plyr = plSnap.val()
        plyr['number'] = +plSnap.key;
        if("active" in plyr){
          feed.push(plyr);
        }
      });
      feed.sort((a,b) => {
        return parseFloat(b.points) - parseFloat(a.points);
      });
      fset = '<fieldset data-role="controlgroup" id="playerlist">'
      for(var i=0; i<feed.length; i++){
        //allItems += '<li data-rowid="' + feed[i].number + '" data-icon="delete"><a href="#">' + feed[i].number +'. ' + feed[i].name + '<p class="ui-li-aside"> <strong>'+feed[i].points+' poeng</strong></p></a></li>';
        allItems += '<input type="checkbox" name="elcheckbox'+feed[i].number+'" id="elcheckbox'+feed[i].number+'"><label for="elcheckbox'+feed[i].number+'">Spiller '+feed[i].number+' - '+feed[i].name+'<span style="float:right">'+feed[i].points+'p</span></label>';
      };
      $("#playerlist").html(fset+allItems+'</fieldset>');
      $("#playerlist").trigger("create");
      window.location = '#eliminationPage';
    });
  });

  $("#btnScores").on('click', e => {
    const feedRef = firebase.database().ref('shows/show/players/player-data')
    var feed = [];
    feedRef.orderByKey().once('value', (snaps, error) => {
      var allItems = '';
      snaps.forEach(plSnap => {
        const plyr = plSnap.val()
        plyr['number'] = +plSnap.key;
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
      $("#scoreList").empty().append(allItems).listview().listview("refresh");
      window.location = '#scoreBoardPage';
    });
  });

  $("#btnAdjustNames").on('click', () => {
    window.location = '#namePage';
  });

  $("#btnEndShow").on('click', () => {
    $("#popupDialog").popup("open");
  });

  $("#btnNewShow").on('click', e => {
    var ref = firebase.database().ref("shows/show");
    ref.remove();
    ref.child("currentScene").set(1);
    ref.child("currentRound").set(1);
    for (var i=1;i<14;i++){
      $('#checkbox'+i).checkboxradio().checkboxradio( "option", "disabled", false );
      $('#checkbox'+i).closest("div").removeClass('mobile-checkboxradio-disabled');
    };

    $('#playerInput')[0].reset();
    $('#btnElimination').closest("ui-btn").hide();
    $('#btnNewScene').closest("ui-btn").show();
    window.location = '#namePage';
  });

  $("#btnEditScene").on('click', () => {
    console.log("edit scene");
    //make list dynamically
    var ref = firebase.database().ref("shows/show/scenes");
    var data = [];
    ref.once('value', snapshot => {
      var numScenes = snapshot.numChildren();
      console.log(numScenes);
      var allItems = '';
      for (var i=1; i<= numScenes; i++){
        var scPts = snapshot.child('scene'+i).child('points').val();
        allItems += '<li data-rowid="' + i + '" data-icon="delete"><a href="#">Scene ' + i + '<p class="ui-li-aside"> Poeng: <strong>'+scPts+'</strong></p></a></li>';
      }
      $("#scenelist").empty().append(allItems).listview().listview("refresh").enhanceWithin();
    });



    $("#scenelist").on("click", "li input", e => {
      e.stopImmediatePropagation();
      var rowid = $(this).parents("li").data("rowid");
      var btnText = $(this).val();
      console.log("You clicked the button: " + btnText + " on row number: " + rowid);
    });

    $("#scenelist").on("click", "li a", e => {
      var rowid = $(this).parents("li").data("rowid");
      console.log("You clicked the " +rowid+" listitem");
    });
    window.location = '#sceneEditPage';
  });

  $("#endShowYes").on('click', () => {
    var ref = firebase.database().ref("shows/show");
    ref.remove();
    for (var i=1;i<14;i++){
      $('#checkbox'+i).closest("div").removeClass('ui-state-disabled');
      $('#elcheckbox'+i).closest("div").removeClass('ui-state-disabled');
    };
    $('#playerInput')[0].reset();
    $('#btnElimination').closest("ui-btn").hide();
    $('#btnNewScene').closest("ui-btn").show();
    $('#btnContinue').closest("ui-btn").hide();
    window.location = '#mainMenu';
  });

  $("#btnSceneSubmit").on('click', () => {

    //Get a json of players and set .players
    var curSceneDB = "shows/show/scenes/scene" + currentScene;

    //Get points and set .points
    var radios = $('[name="radio-poeng"]');
    var poeng = 0;
    for(var i=0;i<radios.length;i++){
      if(radios[i].checked)
      poeng = radios[i].value;
    }
    pointRef = firebase.database().ref(curSceneDB + '/points');
    pointRef.set(poeng);

    //Get players and set .players
    var newPlayerRef = firebase.database().ref(curSceneDB + '/players');
    var playerScoreRef = firebase.database().ref('shows/show/players/player-data')
    var playerListRef = firebase.database().ref('shows/show/players/player-list')
    for (var i=1;i<14;i++){
      var curPlayr = i;
      //console.log(curPlayr);
      var curCheck = "checkbox"+i;
      if ($('#'+curCheck).is(":checked"))
      {
        newPlayerRef.child(curPlayr).set(true);
        playerScoreRef.child(curPlayr).child('points').transaction(pScore => {
          return +pScore + +poeng;
        });
        playerListRef.child(curPlayr).set(false);
        playerScoreRef.child(curPlayr).child("active").set(false);
        $('#'+curCheck).checkboxradio().checkboxradio( "option", "disabled", true );
        $('#'+curCheck).closest('div').addClass('mobile-checkboxradio-disabled');
      };
    }
    playerListRef.once('value', snap => {
      var foundOne = snap.forEach(snapshot => {
        if (snapshot.val() === true) {
          window.location = '#showMenu';
          return true; // found one, cancel enumeration
        }
      });
      if (!foundOne) {
        // all children failed the condition.
        $('#btnNewScene').closest("ui-btn").hide();
        $('#btnElimination').closest("ui-btn").show();
        if(snap.numChildren() == 1){
          window.location = '#scoreBoardPage';
        }else{
          window.location = '#showMenu';
        }
      }
    });

    var CurSceneRef = firebase.database().ref("shows/show/currentScene");
    CurSceneRef.set(currentScene+1);


  });

  $("#btnSceneCancel").on('click', () => {
    var showCurScene = "shows/show/currentScene";
    var ref = firebase.database().ref(showCurScene);
    window.location = '#showMenu';
  });

  $("#btnEliminate").on('click', event => {
    //Get players and set .players
    var playerListRef = firebase.database().ref('shows/show/players/player-list');
    var playerDataRef = firebase.database().ref('shows/show/players/player-data');
    var cRoundRef = firebase.database().ref('shows/show/currentRound');
    for (var i=1;i<14;i++){
      var cPlayr = i;
      //console.log(curPlayr);
      var cCheck = "checkbox"+i;
      if ($('#el'+cCheck).is(":checked"))
      {
        playerListRef.child(cPlayr).remove();
        playerDataRef.child(i).child("active").remove();
        $('#'+cCheck).checkboxradio().checkboxradio( "option", "disabled", true );
        $('#'+cCheck).closest('div').addClass('mobile-checkboxradio-disabled');
      };
    };
    //enable all other player checkboxes
    playerListRef.once('value', function(snapshot){
      snapshot.forEach(function(playerSnapshot){
        var key = playerSnapshot.key;
        playerListRef.child(key).set(true);
        playerDataRef.child(key).child("active").set(true);
        $('#checkbox'+key).checkboxradio().checkboxradio("option", "disabled", false);
        $('#checkbox'+key).closest("div").removeClass('mobile-checkboxradio-disabled');
      });
      $('#btnElimination').closest("ui-btn").hide();
      if(snapshot.numChildren() >1){
        $('#btnNewScene').closest("ui-btn").show();
      }else{
        $('#btnNewScene').closest("ui-btn").hide();
        console.log("the show is over");
      }
    });
    cRoundRef.set(currentRound+1);
    window.location = '#showMenu';
  });

  $("#btnPardon").on('click', event => {
    var playerListRef = firebase.database().ref('shows/show/players/player-list');
    var playerDataRef = firebase.database().ref('shows/show/players/player-data');
    playerListRef.once('value', function(snapshot){
      snapshot.forEach(function(playerSnapshot){
        var key = playerSnapshot.key;
        playerListRef.child(key).set(true);
        playerDataRef.child(key).child("active").set(true);
        $('#checkbox'+key).checkboxradio().checkboxradio("option", "disabled", false);
        $('#checkbox'+key).closest("div").removeClass('mobile-checkboxradio-disabled');
      });
      $('#btnElimination').closest("ui-btn").hide();
      if(snapshot.numChildren() >1){
        $('#btnNewScene').closest("ui-btn").show();
      }else{
        $('#btnNewScene').closest("ui-btn").hide();
        console.log("the show is over");
      }
    window.location = '#showMenu' ;
    });
  });

  $("#btnElimCancel").on('click', event => {
    window.location = '#showMenu' ;
  });

  $("#btnEditCancel").on('click', event => {
    window.location = '#showMenu' ;
  });

  $("#btnScoreCancel").on('click', event => {
    window.location = '#showMenu' ;
  });

})();
