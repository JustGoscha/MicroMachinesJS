var app = angular.module('app', []);

app.directive('game', function(MainLoop){
  return {
    restrict: 'A',
    link: function(scope, element){
      MainLoop.setElement(element[0]);
    }
  };
});

// main loop
app.factory('MainLoop', function(Camera, Players, Maps, Resources, Vehicles, DrivingPhysics){
  var MainLoop = new Object();

  // the 2D context of the canvas
  var canvas = null;

  // the canvas element
  var canvasElement = null;

  MainLoop.setElement = function(element){
    canvas = element.getContext('2d');
    canvasElement = element;

    // make it crispy!  
    canvas['imageSmoothingEnabled'] = false;
    canvas['mozImageSmoothingEnabled'] = false;
    canvas['webkitImageSmoothingEnabled'] = false;

  }

  var clearCanvas = function(){
    // canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvas.width = canvas.width;
  }

  var showFPS = function(time){
    var FPS = Math.round(1000/time);
    canvas.font = "bold 18px sans-serif"
    canvas.fillText(FPS, Camera.positionX+canvasElement.width/2-40, Camera.positionY+canvasElement.height/2-20);
  }
  
  var lastTime = new Date();

  MainLoop.elapsedTime = 0;

  // main drawing loop
  var redraw = function(timestamp){
    // before starting to draw, always clean the canvas first
    clearCanvas();

    // compute elapsed time

    var currentTime = timestamp;
    if(!currentTime)
      currentTime = new Date();
    var elapsedTime = currentTime - lastTime;

    // get the newest camera position
    Camera.updateCamera(canvas);

    // the first draw the things that are lowest, on the lowest level is
    // the MAP
    Maps.draw(canvas);

    // update Driving physics
    DrivingPhysics.update(elapsedTime);

    // then come the CARS/PLAYERs
    Players.draw(canvas);

    // draw FPS
    showFPS(elapsedTime);

    lastTime = currentTime;
  }

  MainLoop.startDrawCycle = function(){
    var animFrame = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          null ;

    var recursiveAnim = function(timestamp) {
      redraw(timestamp);
      animFrame(recursiveAnim);
    }

    animFrame(recursiveAnim);
  }

  Resources.loadResources(function(){
    // add all the Maps and Cars
    var v1 = new Vehicles.Vehicle(700,400,0.9,1.5,0.1,"car_test");
    Vehicles.addVehicle('testcar', v1);
    var v2 = new Vehicles.Vehicle(700,400,0.9,1.5,0.1,"car_test2");
    Vehicles.addVehicle('testcar2', v2);


    // adds the testmap
    var m1 = new Maps.Map('testmap', 'map_test');
    Maps.addMap(m1);
    Maps.currentMap = m1;

    var p1 = new Players.Player("Player 1", "arrowkeys");
    p1.currentPositionX = 600;
    p1.currentPositionY = 1200;
    Players.addPlayer(p1);

    var p2 = new Players.Player("Player 2", "WASD");
    p2.currentPositionX = 700;
    p2.currentPositionY = 1200;
    p2.vehicle = v2;
    Players.addPlayer(p2);

    Camera.setDimensions(canvasElement.width, canvasElement.height, canvas);

    // starts the draw cycle when everything is loaded;
    MainLoop.startDrawCycle();
  });


  return MainLoop;
});




// requirements

// VEHICLES

// --------- TODO: ---------
// vehicles should be actually just types and have more than just one imageUrl
// so the players can select the representation of the vehicle themselves,
// but thebehavior ofthe vehicles shouldn't change.

app.factory('Vehicles',function(Resources){
  var Vehicles = new Object();

  var listOfVehicles = new Object();

  // Vehicle class
  // maxspeed (px/s), acceleration(px/s), maneuver (mvr*180/s), friction (0<friction<1), bounciness (0<b<1)
  function Vehicle(maxspeed, acceleration, friction, maneuver, bounciness, image){
    this.maxspeed = maxspeed;
    this.acceleration = acceleration;
    this.friction = friction;
    this.maneuver = maneuver;
    this.bounciness = bounciness;

    this.reverseSpeed = -0.3*this.maxspeed;


    // let the size at first be determined by the image...
    this.image = Resources.images[image];

    var scaleFactor = 2;
    this.scaledHeight = this.image.height*scaleFactor;
    this.scaledWidth = this.image.width*scaleFactor;

    this.getMaxspeed = function(){
      return this.maxspeed;
    }
    this.getAcceleration = function(){
      return this.acceleration;
    }

    this.getReverseSpeed = function(){
      return this.reverseSpeed;
    }

    this.getFriction = function(){
      return this.friction
    }
    this.getManeuver = function(){
      return this.maneuver;
    }
    this.getBounciness = function(){
      return this.bounciness;
    }
    this.getImageUrl = function(){
      return this.imageUrl;
    }
  }

  Vehicles.Vehicle = Vehicle;

  Vehicles.getList = function(){
    return listOfVehicles;
  }

  Vehicles.getVehicle = function(name){
    return listOfVehicles[name];
  }

  Vehicles.addVehicle = function(name, vehicle){
    listOfVehicles[name] = vehicle;
  }



  return Vehicles;
});

  // all vehicles have the parameters:
    
    // max velocity
    // acceleration - determines how quick they reach max velocity

    // ground friction - determines their drift

    // maneuvarability - determines how quick it can turn

    // bounciness when hit or crash

    // dimensions: width, height or pixel precise

// COLLISION DETECTION
app.factory('CollisionDetection', function(Players, Maps){
  var CollisionDetection = new Object();

  function detectCarCollisions(){
    var players = Players.getPlayerList();
    for(var i in players){

    }
  }

  function detectMapCollisions(){

  }

  CollisionDetection.detectCollisions = function(){
    detectCarCollisions();
    detectMapCollisions();
  }

  return CollisionDetection;
});

// MAP
app.factory('Maps', function(Resources){
  var Maps = new Object();

  Maps.currentMap = null;

  var mapList = new Object();

  function Map(name, image){
    this.name = name;
    this.image = Resources.images[image];
  }

  Maps.Map = Map;

  // get list of maps
  Maps.getList = function (){
    return mapList;
  }

  Maps.getMap = function(name){
    return mapList[name];
  }

  Maps.addMap = function(map){
    mapList[map.name] = map;
  }

  Maps.draw = function(canvas){
    canvas.drawImage(Maps.currentMap.image, 0, 0, Maps.currentMap.image.height*2, Maps.currentMap.image.width*2);
  }

  return Maps;
});

  // MAIN road - normal acceleration, velocity

  // side road - normal acceleration, velocity (less camera weight?)

  // HOLES - (water, lava etc.) instant death
    // different kind of animations (explode, drown, fall)

  // BOOST/slowdown FIELDS - alter speed (in a cetain direction)
    // properties

  // ANGLE variation FIELDS - alter angle
    // properties

  // WALLS: 
    // bounciness


  // as JSON ?

// var json = {
//   name: "circle",
//   picture: "xy.jpg",
//   main: [coordinates],
//   holes: [coordinates],
//   boostfields: [
//     {
//       type: "xy",
//       properties: {...},
//       positions: [coordinates]
//     },...
//   ],
//   walls: []
// }

// GAMEPLAY
  
  // detection who is first: 
    // who is nearest to the next main waypoint? 
      // problems: what if a wall is between player... in a very sharp curve vor example
     //     V
     //   - | -
     //   - | - 
     //   - | -
     //     U

// CAMERA
app.factory('Camera', function(Players){
  var Camera = new Object();

  Camera.positionX = 0;
  Camera.positionY = 0;

  var width = 0;
  var height = 0;

  var cX = 0;
  var cY = 0;

  Camera.setDimensions = function(w,h,canvas){
    width = w;
    height = h;

    cX = w/2;
    cY = h/2;

    canvas.translate(cX, cY);
  }

  // Camera takes the canvas object to translate the canvas according to the camera

  Camera.setCamera = function(x,y,canvas){
    var difX = Camera.positionX - x;
    var difY = Camera.positionY - y;
    Camera.positionX = x;
    Camera.positionY = y;
    // translate only the difference to previous position
    canvas.translate(difX, difY);
  }

  Camera.updateCamera = function(canvas){
    var players = Players.getPlayerList();
    var playerCount = players.length;

    var sumX = 0;
    var sumY = 0;

    for(var i in players){
      sumX = sumX + players[i].currentPositionX;
      sumY = sumY + players[i].currentPositionY;
    }
    // set the new computed camera position -> centroid of all player coordinates
    Camera.setCamera(sumX/playerCount, sumY/playerCount, canvas);
  }

  return Camera;
});

    // camera position

    // camera size = canvas size


// CONTROLS
app.factory('Controls', function(){
  var Controls = new Object();

  var standardControls = {
    "WASD": {
      "up":  87,
      "down": 83,
      "left": 65,
      "right": 68,
      "handbreak": 71 // "G"
    }, 
    "arrowkeys": {
      "up": 38,
      "down": 40,
      "left": 37,
      "right": 39,
      "handbreak": 32
    }
  }

  // input listen function
  Controls.listenForKeyInput = function(controls, state){
    angular.element(document).bind('keydown', function(event){
      switch (event.which){
        case controls.up: {
          event.preventDefault();
          state.accelerating = true;
        }
        break;
        case controls.down: {
          event.preventDefault();
          state.breaking = true;
        }
        break;
        case controls.left: {
          event.preventDefault();
          state.turningLeft = true;
        }
        break;
        case controls.right: {
          event.preventDefault();
          state.turningRight = true;
        }
        break;
        case controls.handbreak:{
          event.preventDefault();
          state.handbreaking = true;
        }
        break;
      }
    })

    angular.element(document).bind('keyup', function(event){
      switch (event.which){
        case controls.up: {
          event.preventDefault();
          state.accelerating = false;
        }
        break;
        case controls.down: {
          event.preventDefault();
          state.breaking = false;
        }
        break;
        case controls.left: {
          event.preventDefault();
          state.turningLeft = false;
        }
        break;
        case controls.right: {
          event.preventDefault();
          state.turningRight = false;
        }
        break;
        case controls.handbreak:{
          event.preventDefault();
          state.handbreaking = false;
        }
        break;
      }
    })
  }

  Controls.getControls = function(name){
    return standardControls[name];
  }

  return Controls;
});

  // UP - acceleration

  // DOWN - de-acceleration and going back

  // LEFT/RIGHT - changes the angle of the car

  // (multiple controls on same machine)


// PLAYERS
app.factory('Players', function(Vehicles, Controls){
  var Players = new Object();

  var playerList = [];
  
  /* --------- PLAYER CLASS ----------*/
  /* ---- for a single player --------*/
  function Player(name, controls){
    this.name = name;
    this.vehicleName = "testcar";
    this.vehicle = Vehicles.getVehicle(this.vehicleName);

    this.controls = Controls.getControls(controls);

    this.state = {
      accelerating: false,
      breaking: false,
      turningLeft: false,
      turningRight: false,
      handbreaking: false
    }

    Controls.listenForKeyInput(this.controls, this.state);

    this.currentVelocity = 0;

    // the rotation of the car itself e.g. of the sprite
    this.currentRotation = 0;

    // the direction in which the velocity vector is going in
    this.currentAngle = 0;

    // the hit force/velocity and hit angle if you hit a Wall, or another car
    this.hitVelocity = 0;
    this.hitAngle = 0;

    // the force of rotation in pi per second in clockwise direction
    // this.rotationalForce = 0;

    this.currentPositionX = 0;
    this.currentPositionY = 0;

    this.isOut = false;

    this.setPosition = function(x,y){
      this.currentPositionX = x;
      this.currentPositionY = y;
    }

    this.getVehicle = function(){
      return vehicle;
    }

    this.setVehicle = function(name){
      this.vehicleName = name;
      this.vehicle = Vehicles.getVehicle(name);
    }
  }

  Players.Player = Player;

  /* ----- PLAYERS class functions ----- */
  Players.getPlayerList = function(){
    return playerList;
  }

  Players.getPlayer = function(playerIndex){
    // TODO search for playername
    if(playerList[playerIndex]){
      return playerList[playerIndex];
    }
  }

  Players.removePlayer = function(playerIndex){
    playerList.splice(playerIndex,1);
  }

  Players.addPlayer = function(player){
    playerList.push(player);
  }


  Players.draw = function(canvas){
    for(var i in playerList){
      var player = playerList[i];

      // save the canvas state
      canvas.save();

      // do the rotation hokus pokus
      canvas.translate(player.currentPositionX, player.currentPositionY);
      canvas.rotate(player.currentRotation);

      canvas.translate(-player.vehicle.scaledWidth/2, -player.vehicle.scaledHeight/2);

      canvas.drawImage(player.vehicle.image,
        0,
        0,
        player.vehicle.scaledWidth, 
        player.vehicle.scaledHeight
        );

      // restore the pre-rotation canvas state
      canvas.restore();
    }
  }

  return Players;
});

  // have a vehicle (all the same one!)

  // current speed
  // current angle
  // current position on the map


app.factory('DrivingPhysics', function(Players, CollisionDetection){
  var DrivingPhysics = new Object();

  function _accelerate(player){
    var acc = player.vehicle.getAcceleration()*time/1000;

    var newVelocity = player.currentVelocity + acc;

    // don't let it go faster then max speed
    if(newVelocity >= player.vehicle.getMaxspeed()){
      player.currentVelocity = player.vehicle.getMaxspeed();
    } else {
      player.currentVelocity = newVelocity;
    }
  }

  function _deaccelerate(player){
    if(player.currentVelocity > 0){
      // later make it based on ground
      var velocity = player.currentVelocity - player.vehicle.getAcceleration()*0.3/time;
      if(velocity < 0 ){
        player.currentVelocity = 0;
      } else {
        player.currentVelocity = velocity;
      }
    } else if ( player.currentVelocity < 0 ) {
      var velocity = player.currentVelocity + player.vehicle.getAcceleration()*0.3/time;
      if(velocity > 0 ){
        player.currentVelocity = 0;
      } else {
        player.currentVelocity = velocity;
      }
    }
  }

  function _break (player){

    var slow = player.vehicle.getAcceleration()*time/500; // breaks twice as fast as accelerates

    player.currentVelocity = player.currentVelocity - slow;

    if(player.currentVelocity <= player.vehicle.getReverseSpeed()){
      player.currentVelocity = player.vehicle.getReverseSpeed();
    }
  }

  function _turnLeft (player) {
    var rotation = player.vehicle.maneuver*Math.PI*time/1000;

    player.currentRotation = (player.currentRotation - rotation)%(2*Math.PI);
    player.currentAngle = player.currentRotation;


  };
  function _turnRight (player) {
    var rotation = player.vehicle.maneuver*Math.PI*time/1000;
    player.currentRotation = (player.currentRotation + rotation)%(2*Math.PI);
    player.currentAngle = player.currentRotation;
    

  };
  function _handbreak (player) {
    
  }

  function updatePosition(player){
    var changeX = (Math.sin(player.currentAngle)*player.currentVelocity)*time/1000;
    var changeY = -(Math.cos(player.currentAngle)*player.currentVelocity)*time/1000;

    player.setPosition(player.currentPositionX+changeX, player.currentPositionY+changeY);
  }

  // elapsed time
  var time = 0;

  // update the driving physics for every player, based on the controls they set
  DrivingPhysics.update = function(elapsedTime){
    time = elapsedTime;
    var playerList = Players.getPlayerList();
    for(var i in playerList){
      var player = playerList[i];

      
      if (player.state.breaking){
        _break(player);
      } else if (player.state.accelerating){ 
        _accelerate(player);
      } else {
        _deaccelerate(player);
      }

      if(player.currentVelocity!=0){
        if (player.state.turningLeft){
          _turnLeft(player);
        }
        if (player.state.turningRight){
          _turnRight(player);
        }
      }

      if (player.state.handbreaking){
        _handbreak(player);
      }
      updatePosition(player);
    }
  }

  return DrivingPhysics;
});

app.factory('Resources', function(){
  var Resources = new Object();

  var imageSources = {
    map_test: "script/assets/maps/testmap2.png",
    car_test: "script/assets/cars/testcar.png",
    car_test2: "script/assets/cars/testcar2.png"
  };

  Resources.images = {};

  Resources.loadResources = function(callback){
    loadImages(imageSources, function(images){
      Resources.images = images;
      callback();
    });
  }

  function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for(var src in sources) {
      numImages++;
    }
    for(var src in sources) {
      images[src] = new Image();
      images[src].onload = function() {
        if(++loadedImages >= numImages) {
          callback(images);
        }
      };
      images[src].src = sources[src];
    }
  }

  return Resources;
});

app.controller('DebugCtrl', function($scope, Camera, Players, MainLoop){

});