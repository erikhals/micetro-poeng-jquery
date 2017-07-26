(function () {
  //Firebase functions
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


  //Declare global variables
  const showRef = firebase.database().ref("shows/show");
  const csRef = firebase.database().ref("shows/show/currentScene");
  var currentScene;

  const crRef = firebase.database().ref("shows/show/currentRound");
  var currentRound;

  const ceRef = firebase.database().ref("shows/show/currentEvent");
  var currentEvent;

  const playerListRef = firebase.database().ref("shows/show/players/player-list");
  var playerList;
  const playerDataRef = firebase.database().ref("shows/show/players/player-data");
  var playerData;
  const showEventsRef = firebase.database().ref("shows/show/events")
  var showEvents;

  var currentPlayers;
  var currentActive;
  var winner;

  const lastEventRef = firebase.database().ref("shows/show/lastEvent");
  var lastEvent;

  var undoData;
  var undoPlayers;

  //Disable and enable checkboxes functions
  jQuery.fn.extend({
    enableCheckbox: function() {
      return this.each(function() {
        $(this).checkboxradio().checkboxradio( "option", "disabled", false );
        $(this).closest('div').removeClass('mobile-checkboxradio-disabled');
      });
    },
    disableCheckbox: function() {
      return this.each(function() {
        $(this).checkboxradio().checkboxradio( "option", "disabled", true );
        $(this).closest('div').addClass('mobile-checkboxradio-disabled');
      });
    }
  });

  //Update buttons on show menu
  function buttonsUpdate(){
    if (currentActive == 0 && currentPlayers > 1){
      $('#btnElimination').closest('.ui-btn').show();
      $('#btnNewScene').closest('.ui-btn').hide();
      $("#showInfo").html("<h3>Runde "+currentRound+" - Eliminasjon</h3>");
    }else if(currentPlayers == 1){
      $('#btnNewScene').closest('.ui-btn').hide();
      $('#btnElimination').closest('.ui-btn').hide();
      $("#showInfo").html("<h3>Kveldens Micetro er Spiller "+winner+"</h3>");
    }else{
      $('#btnElimination').closest('.ui-btn').hide();
      $('#btnNewScene').closest('.ui-btn').show();
      $("#showInfo").html("<h3>Runde "+currentRound+" - Scene "+currentScene+"</h3>");
    }
  }

  //Refresh page - not used
  function refreshPage(){
    jQuery.mobile.changePage(window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
  }

  //Get player names
  function getNames(players){
    var output = "";
    players.forEach(snap=>{
      var name = playerData.child(snap.key).child("name").val();
      output += snap.key +"."+ name+", ";
    });
    output = output.slice(0, -2);
    return output;
  }

  // Set Global Variables
  csRef.on('value', csnap => {
    currentScene = csnap.val();
    console.log("CurrentScene:" + currentScene);
  });
  crRef.on('value', crsnap => {
    currentRound = crsnap.val();
    console.log("CurrentRound:" + currentRound);
  });

  lastEventRef.on('value', lesnap =>{
    lastEvent = lesnap.val();
  });
  showEventsRef.on('value', shsnap =>{
    showEvents = shsnap;
    currentEvent = shsnap.numChildren()+1;
    console.log(currentEvent);
  });
  playerDataRef.on('value', pdsnap => {
    playerData = pdsnap;
  });

  playerListRef.on('value', psnap => {
    playerList = psnap;
    currentPlayers = psnap.numChildren();
    currentActive = 0;
    psnap.forEach(snapchild => {
      if (snapchild.val()==true){
        currentActive++;
      };
    });
  });

  // Log out button
  $(".logOut").click( e => {
    firebase.auth().signOut().then(e => {
      // Sign-out successful.
      window.location = 'index.html#page1';
    } , function(error) {
      // An error happened.
      console.log("Error with sign out");
    });
  });

  //Main menu
  $("#mainMenu").on('pagebeforeshow', e => {
    //$.mobile.loading( "show" );
    csRef.once('value', csnap => {
      currentScene = csnap.val();
    }).then(()=>{
      $("#btnContinue").closest('.ui-btn').hide();
      $("#btnNewShow").closest('.ui-btn').hide();
      //$.mobile.loading( "hide" );
      if(currentScene == null){
        $("#btnContinue").closest('.ui-btn').hide();
        $("#btnNewShow").closest('.ui-btn').show();
      }else{
        $("#btnContinue").closest('.ui-btn').show();
        $("#btnNewShow").closest('.ui-btn').show();
      }
    });
  });

  $("#btnContinue").on('click', e => {
    window.location = '#showMenu';
  });

  $("#btnNewShow").on('click', e => {
    showRef.remove();
    csRef.set(1);
    crRef.set(1);
    ceRef.set(1);
    for (var i=1;i<14;i++){
      $('#checkbox'+i).enableCheckbox();
    };

    $('#playerInput')[0].reset();
    $('#btnElimination').closest("ui-btn").hide();
    $('#btnNewScene').closest("ui-btn").show();
    window.location = '#namePage';
  });

  //Name page
  $("#playerInput").submit(e => {
    var $form = $(this);
    var data = [];
    //Get all player names and set the data in Firebase
    for (i=1;i<14;i++){
      var playerSend = $("#player"+i).val();
      playeri= i;
      if(!playerSend && currentScene == 1){     //player has no name, delete entry
        playerListRef.child(playeri).remove();
        playerDataRef.child(playeri + "/active").remove();
        $('#checkbox'+i).disableCheckbox();
      }else if(currentScene == 1){              //the show is starting, set name and status
        playerListRef.child(playeri).set(true);
        playerDataRef.child(playeri).child("name").set(playerSend);
        playerDataRef.child(playeri).child("active").set(true);
        $('#checkbox'+i).enableCheckbox();
      }else{                                    //the show has started, set only name
        ref.child("player-data").child(playeri).child("name").set(playerSend);
      };
    };
    window.location = '#showMenu';
    return false;
  });

  $("#btnNamesCancel").on('click', e => {
    parent.history.back();
    return false;
  });

  //Show menu
  $("#showMenu").on('pagebeforeshow', e => {
    $('#btnElimination').closest('.ui-btn').hide();
    //Get players from database
    playerListRef.once('value', psnap => {
      currentPlayers = psnap.numChildren();
      currentActive = 0;
      //Set number of active players not played this round
      psnap.forEach(snapchild => {
        if (snapchild.val()==true){
          currentActive++;
          winner = snapchild.key;
        };
      });
      //Update buttons and header
      buttonsUpdate();
      if(lastEvent){ //Undo function
        $('#btnUndo').closest('.ui-btn').removeAttr('disabled').removeClass('ui-state-disabled');
      }
    });
  });

  $("#btnNewScene").on('click', e => {
    $('#sceneInput')[0].reset();    //reset forms and buttons
    for(var i=1;i<=13;i++){
      $('#checkbox'+i).checkboxradio().checkboxradio("refresh");
    };
    $('#btnSceneSubmit').closest('.ui-btn').addClass('ui-state-disabled');
    $('#sceneHeader').html("Scene " + currentScene);
    window.location = '#scenePage';
  });

  $("#btnElimination").on('click', e => {
    var feed = [];
    playerDataRef.orderByKey().once('value', (snaps, error) => {
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
      for(var i=0, j=feed.length; i<j; i++){
        allItems += '<input type="checkbox" name="elcheckbox'+feed[i].number+'" id="elcheckbox'+feed[i].number+'"><label for="elcheckbox'+feed[i].number+'">Spiller '+feed[i].number+' - '+feed[i].name+'<span style="float:right">'+feed[i].points+'p</span></label>';
      };
      $("#playerlist").html(fset+allItems+'</fieldset>');
      $("#playerlist").trigger("create");
      window.location = '#eliminationPage';
    });
  });

  $("#btnUndo").on('click', e => {
    lastEventRef.once('value', snap => {                  //Get last event from database
      undoData = snap.val();
      undoPlayers = {};
      undoPlayers = undoData['players'];
      if (undoData.hasOwnProperty('points')){             //last event was a scene
        undoHeader = "Scene " + (currentScene-1);
        undoText = "Spillere: " + Object.keys(undoPlayers);
        undoPoints = "<p>Poeng: " + undoData['points'] + "</p>";
      } else if (undoData.hasOwnProperty('eliminated')){  //last event was elimination
        undoHeader = "Eliminasjonsrunde " + (currentRound-1);
        undoText = "Eliminerte: " + Object.keys(undoPlayers);
        undoPoints = "";
      }else if (undoData.hasOwnProperty('pardoned')){     //last event was a pardon
        undoHeader = "Eliminasjonsrunde " + (currentRound-1);
        undoText = "Alle videre - ingen Eliminerte";
        undoPoints = "";
      }
      $("#undoEvent").text(undoHeader);                   //prepare dialog
      $("#undoData").html("<p>" + undoText + "</p>" + undoPoints );
      $("#undoDialog").popup("open");                     //show dialog


    });
  });

  $("#btnScores").on('click', e => {
    var feed = [];
    playerDataRef.orderByKey().once('value', (snaps, error) => {
      var allItems = '';
      snaps.forEach(plSnap => {
        var plyr = plSnap.val()
        plyr['number'] = +plSnap.key;
        if(plyr['points'] === undefined){
          plyr['points'] = 0;
        }
        if(plyr['name'] != ""){
          feed.push(plyr);
        }
      });
      feed.sort((a,b) => {
        return parseFloat(b.points) - parseFloat(a.points);
      });
      for(var i=0, j=feed.length; i<j; i++){
        allItems += '<li data-rowid="' + feed[i].number + '" ><span style="float:left">' + feed[i].number +'. ' + feed[i].name + '</span><span style="float:right">'+feed[i].points+' poeng</span></li>';

      };
      $("#scoreList").empty().append(allItems).listview().listview("refresh");
      window.location = '#scoreBoardPage';
    });
  });

  $("#btnAdjustNames").on('click', e => {
    window.location = '#namePage';
  });

  $("#btnEndShow").on('click', e => {
    $("#endshowDialog").popup('open');
  });

  //Scene page
  $("#scenePage").on('create', e => {
    playerDataRef.once("value").then(snapshot => {
      //Enable button 13 if player 13 has a name
      if(snapshot.child("13").child("name").val() == null){
        $("#knapp13").hide();
      }else{
        $("#knapp13").show();
      }
      for (i=1; i<14; i++) {      //disable all checkboxes to initialise
        $('#checkbox'+i).disableCheckbox();
      };
      snapshot.forEach(childSnap => {     //enable checkboxes if active
        var childval = childSnap.child("active").val();
        if (childval == true){
          $('#checkbox'+childSnap.key).enableCheckbox();
        }
      });
      for (i=1; i<14; i++) {      //refresh all checkboxes
        $('#checkbox'+i).checkboxradio().checkboxradio("refresh");
      };
    });
  });

  $(".radioKnapp").click( e => {
    $('#btnSceneSubmit').removeAttr('disabled').removeClass('ui-state-disabled');
  });

  $("#btnSceneSubmit").on('click', e => {

    //Get a json of players and set .players
    var curSceneRef = firebase.database().ref("shows/show/events/" + currentEvent);
    lastEventRef.remove();
    var sceneNavn = $('#sceneNavn').val();
    curSceneRef.child('/name').set(sceneNavn);
    curSceneRef.child('/round').set(currentRound);
    curSceneRef.child('/number').set(currentScene);
    //Get points and set .points
    var radios = $('[name="radio-poeng"]');
    var poeng = 0;
    for(var i=0,j=radios.length;i<j;i++){
      if(radios[i].checked)
      poeng = radios[i].value;
    }
    pointRef = curSceneRef.child('/points');
    pointRef.set(+poeng);
    //Set undo data
    lastEventRef.child("points").set(+poeng);
    $('#btnUndo').closest('.ui-btn').removeAttr('disabled').removeClass('ui-state-disabled');

    //Get players and set .players
    var newPlayerRef = curSceneRef.child('/players');
    var lastPlayerRef = lastEventRef.child('/players');
    for (var i=1;i<14;i++){
      var curPlayr = i;
      var curCheck = "checkbox"+i;
      if ($('#'+curCheck).is(":checked"))
      {
        newPlayerRef.child(curPlayr).set(true);
        lastPlayerRef.child(curPlayr).set(true);
        playerDataRef.child(curPlayr).child('points').transaction(pScore => {
          return +pScore + +poeng;
        });
        playerListRef.child(curPlayr).set(false);
        playerDataRef.child(curPlayr).child("active").set(false);
        $('#'+curCheck).disableCheckbox();
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

    csRef.set(currentScene+1);
  });

  $("#btnEditScene").on('click', e => {
    //make list dynamically
    var ref = firebase.database().ref("shows/show/events");
    var data = [];
    ref.once('value', snapshot => {
      var numScenes = snapshot.numChildren();
      var allItems = '';
      for (var i=1, j=numScenes; i<= j; i++){
        var scPts = snapshot.child(i).child('points').val();
        var scName = snapshot.child(i).child('name').val() || "Navn";
        var scNumber = snapshot.child(i).child('number').val();
        var scRound = snapshot.child(i).child('round').val();
        var scPlyrs = snapshot.child(i).child('players');
        var scPlyrNames = getNames(scPlyrs);
        if (scNumber){
          allItems += '<li data-icon="edit" data-rowid="' + i + '" ><a href="#"> <h1>Sc' + scNumber + ': '+scName+' <p class="ui-li-aside"><strong>'+scPts+'</strong> poeng</p></h1><p><strong>Spillere: '+scPlyrNames+'</strong></p></a></li>';
        }
        else if(scPlyrs.val()){
          allItems += '<li data-icon="edit" data-rowid="' + i + '" ><a href="#"> <h1>Eliminasjonsrunde ' + scRound + ' </h1><p><strong>Eliminert: '+scPlyrNames+'</strong></p></a></li><li data-role="list-divider">Runde '+(scRound+1)+'</li>';
        }
        else{
          allItems += '<li data-icon="edit" data-rowid="' + i + '" ><a href="#"> <h1>Eliminasjonsrunde ' + scRound + ' </h1><p><strong>Alle videre</strong></p></a></li><li data-role="list-divider">Runde '+(scRound+1)+'</li>';
        }
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

  $("#btnSceneCancel").on('click', e => {
    window.location = '#showMenu';
  });

  //Elimination page
  $("#btnEliminate").on('click', e => {
    var curSceneRef = firebase.database().ref("shows/show/events/" + currentEvent);
    curSceneRef.child('/round').set(currentRound);
    //Get players and set .players
    lastEventRef.remove();
    lastEventRef.child('eliminated').set(true);
    for (var i=1;i<14;i++){
      var cPlayr = i;
      var cCheck = "checkbox"+i;
      if ($('#el'+cCheck).is(":checked"))
      {
        playerListRef.child(cPlayr).remove();
        playerDataRef.child(i).child("active").remove();
        curSceneRef.child('players/'+i).set(true);
        lastEventRef.child('players/'+i).set(true);
        $('#'+cCheck).disableCheckbox();
      };
    };
    //enable all other player checkboxes
    playerListRef.once('value', function(snapshot){
      snapshot.forEach(function(playerSnapshot){
        var key = playerSnapshot.key;
        playerListRef.child(key).set(true);
        playerDataRef.child(key).child("active").set(true);
        $('#checkbox'+key).enableCheckbox();
      });
      $('#btnElimination').closest(".ui-btn").hide();
      $('#btnUndo').closest('.ui-btn').removeAttr('disabled').removeClass('ui-state-disabled');
      if(snapshot.numChildren() >1){
        $('#btnNewScene').closest(".ui-btn").show();
      }else{
        $('#btnNewScene').closest(".ui-btn").hide();
      }
    });
    crRef.set(currentRound+1);
    window.location = '#showMenu';
  });

  $("#btnPardon").on('click', e => {
    var curSceneRef = firebase.database().ref("shows/show/events/" + currentEvent);
    curSceneRef.child('/round').set(currentRound);
    lastEventRef.remove();
    lastEventRef.child('pardoned').set(true);
    playerListRef.once('value', function(snapshot){
      snapshot.forEach(function(playerSnapshot){
        var key = playerSnapshot.key;
        playerListRef.child(key).set(true);
        playerDataRef.child(key).child("active").set(true);
        $('#checkbox'+key).enableCheckbox();
      });
      $('#btnElimination').closest("ui-btn").hide();
      if(snapshot.numChildren() >1){
        $('#btnNewScene').closest("ui-btn").show();
      }else{
        $('#btnNewScene').closest("ui-btn").hide();
        console.log("the show is over");
      }
      crRef.set(currentRound+1);
    window.location = '#showMenu' ;
    });
  });

  $("#btnElimCancel").on('click', e => {
    window.location = '#showMenu' ;
  });

  //Undo function
  $("#btnUndoYes").on('click', e =>{
    //Check if last event was scene or elimination round
    if(undoData.hasOwnProperty('points')){            //last event was a scene
      for(var key in undoPlayers){                    //remove points from scene from players
        playerDataRef.child(key).child('points').transaction(pts => {
          x = +pts - +undoData['points'];
          return x;
        });
        playerListRef.child(key).set(true);            //reactivate players
        playerDataRef.child(key).child('active').set(true);
        $('#checkbox'+key).enableCheckbox();
      }
      csRef.set(currentScene-1);                      //update counter and buttons
      ceRef.set(currentEvent-1);
      $('#btnElimination').closest('.ui-btn').hide();
      $('#btnNewScene').closest('.ui-btn').show();
      $('#btnUndo').closest('.ui-btn').addClass('ui-state-disabled');
      $("#showInfo").html("<h3>Runde "+currentRound+" - Scene "+currentScene+"</h3>");
    }else if(undoData.hasOwnProperty('eliminated')){  //last event was elimination round
      for(var key in undoPlayers){                    //de-eliminate players
        playerListRef.child(key).set(false);
        playerDataRef.child(key).child('active').set(false);
        $('#checkbox'+key).enableCheckbox();
      }
      crRef.set(currentRound-1);                      //update counter and buttons
      $('#btnNewScene').closest('.ui-btn').hide();
      $('#btnElimination').closest('.ui-btn').show();
      $('#btnUndo').closest('.ui-btn').addClass('ui-state-disabled');
      $("#showInfo").html("<h3>Runde "+currentRound+" - Eliminasjon</h3>");
    }else if(undoData.hasOwnProperty('pardoned')){    //last event all players were pardoned
      crRef.set(currentRound-1);                      //update counter and buttons
      $('#btnNewScene').closest('.ui-btn').hide();
      $('#btnElimination').closest('.ui-btn').show();
      $('#btnUndo').closest('.ui-btn').addClass('ui-state-disabled');
      $("#showInfo").html("<h3>Runde "+currentRound+" - Eliminasjon</h3>");
    }
    lastEventRef.remove();
    showEventsRef.child(currentEvent-1).remove();
    //buttonsUpdate();
  });

  //End show
  $("#endShowYes").on('click', e => {
    showRef.remove();           //delete show database
    for (var i=1;i<14;i++){     //update buttons
      $('#checkbox'+i).enableCheckbox();

    };
    $('#playerInput')[0].reset();
    $('#btnElimination').closest("ui-btn").hide();
    $('#btnNewScene').closest("ui-btn").show();
    $('#btnContinue').closest("ui-btn").hide();
    window.location = '#mainMenu';
  });

  //Misc
  $("#btnEditCancel").on('click', e => {
    window.location = '#showMenu' ;
  });

  $("#btnScoreCancel").on('click', e => {
    window.location = '#showMenu' ;
  });

})();
