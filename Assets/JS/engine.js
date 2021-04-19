"use strict"
/*  
Things To Add/Redo
    - Add Hill
    - Add Curves
    - Change how resolution is chosen (Probably using dropdown menu outside of game)
    - Parallax Scrolling: Clouds
*/

// General
let canvas,
    context,
    lastTarget,
    keys = [],

// Intervals & Timeouts
    controlInterval,
    menuInterval,
    gameInterval,

// Game related
    //Player
    playerX = 0,
    playerY = 0,
    playerZ = 0,
    speed = 0,
    maxSpeed = 1000,
    acceleration = 10,

    //Path/Roads
    roadWidth = 4000,
    roadLength = 400,
    totalPaths = 100000,
    path = [], //Contains world(x,y,z)

// Menu
    menu = "mainMenu",
    curMenu = 0,
    menuTextSet = [
        //Main Menu
        ["Javascript Outrun", "Start", "Setting", "Credits"],
        //Settings
        ["Settings", "Control", "Resolution", "Return"]
    ],
    //Animation Colours
    menuColour = ["#4c4c4c", "#595959", "#666666", "#474747", "#2c2c2c", "#000000", "#111111", "#2b2b2b", "#1c1c1c", "#131313"],
    menuColourSelect = 0,

// Gradients
    backgroundDay, 
    backgroundNight, 
    dayTextGradient, 
    nightTextGradient,

// Settings
    resolutionSet = [
        [640, 480],
        [800, 600],
        [960, 720],
        [1024, 768],
        [1280, 960],
        [1400, 1050],
        [1440, 1080],
        [1600, 1200],
        [1856, 1392],
        [1920, 1440],
        [2048, 1536]
    ],
    resolutionSelect = 0,

// Audio
/*
    The audio file path must be relative to the HTML file
    Functions/Methods/Etc - https://www.developphp.com/lib/JavaScript/Audio
*/
    buttonMove = new Audio("Assets/Sounds/BTN/buttonMove.mp3"),
    buttonSelect = new Audio("Assets/Sounds/BTN/buttonSelect.mp3"),

    bgm = new Audio(),
    bgmDir = "Assets/Sounds/BGM/",
    bgmSet = [
        "inherit the Light Trail.mp3",
        "電脳漂流記.mp3",
        "ブレンド.mp3"
    ],
    bgmSelect = 0,

    carIdle = new Audio("Assets/Sounds/SFX/carIdle.mp3"),
    carMaxSpeed = new Audio("Assets/Sounds/SFX/maxSpeed.mp3"),
    carRev = new Audio("Assets/Sounds/SFX/speedingUp.mp3"),
    carDecel = new Audio("Assets/Sounds/SFX/slowingDown.mp3"),


// Images
    carStraight = new Image(500, 300), //Width, Height
    carLeft = new Image(500, 300),
    carRight = new Image(500, 300);

// Image and Audio Settings
    carStraight.src = "Assets/Images/carStraight.png";
    carLeft.src = "Assets/Images/carLeft.png";
    carRight.src = "Assets/Images/carRight.png";
    
    buttonMove.volume = 0.2;
    buttonSelect.volume = 0.2;

    bgm.src = bgmDir + bgmSet[bgmSelect];
    bgm.volume = 0.2;
    bgm.loop = true;

    carIdle.volume = .70;
    carIdle.addEventListener("timeupdate", function(){ //Better loop
        let buffer = .4;
        if(this.currentTime > this.duration - buffer){
            this.currentTime = 0;
            this.play();
        }
    });

    carMaxSpeed.volume = .55;
    carMaxSpeed.addEventListener("timeupdate", function(){ //Better loop
        let buffer = .4;
        if(this.currentTime > this.duration - buffer){
            this.currentTime = 0;
            this.play();
        }
    });

    carRev.volume = .55;
    carRev.playbackRate = 0.5;
    carDecel.volume = .55;
    carDecel.playbackRate = 0.0975;    

//Objects
function Road(x, y, z, curve, hill){
    this.x = x;
    this.y = y;
    this.z = z;
    this.curve = curve;
    this.hill = hill;
}

window.onload = function(){
    //Set-up Canvas
    canvas = document.getElementById("gameBox");
    context = canvas.getContext("2d");

    //Auto Resolution Selection
    let windowWidth = window.innerWidth / 2;
    let windowHeight = window.innerHeight / 2;
    for(let i = 0; i < resolutionSet.length; i++){
        if(windowWidth > resolutionSet[i][0] && windowHeight > resolutionSet[i][1]){
            resolutionSelect = i + 1;
        }
    }

    //Resize & Set-Up Gradient
    canvas.width = resolutionSet[resolutionSelect][0];
    canvas.height = resolutionSet[resolutionSelect][1];
    setupGradients();
    
    //Set-up Action Listeners
    //Get Focus on Canvas
    document.addEventListener("mousedown", function(event){
        lastTarget = event.target;
        if(lastTarget == canvas){ //Only when in focus of game
            bgm.play();
            clearAll();
            menuInterval = setInterval(redraw, 60);
            controlInterval = setInterval(menuControl, 300);

            //Resize & Set-Up Gradient
            canvas.width = resolutionSet[resolutionSelect][0];
            canvas.height = resolutionSet[resolutionSelect][1];
            setupGradients();
        }
        else{
            bgm.pause();
            clearAll();
            musicClear();
            context.textAlign = "center";
            let textScale = canvas.height / 8;
            let font = textScale + "px Verdana";
            context.font = font;
            context.fillStyle = "White";
            context.fillText("Click to Resume", canvas.width / 2, canvas.height / 2);
            keys = [];
        }
    }, false);
    
    //Get keyboard events
    document.addEventListener("keydown", function(event){
        if(lastTarget == canvas){ //Only when in focus of game
            event.preventDefault();
            keys[event.keyCode] = true;
        }
    }, false);

    document.addEventListener("keyup", function(event){
        if(lastTarget == canvas){ //Only when in focus of game
            event.preventDefault();
            keys[event.keyCode] = false;
        }
    }, false);

    //Wait for user input
    context.textAlign = "center";
    let textScale = canvas.height / 8;
    let font = textScale + "px Verdana";
    context.font = font;
    context.fillStyle = "White";
    context.fillText("Click to Start", canvas.width / 2, canvas.height / 2);

    generatePath(totalPaths);
}

/**
 * Sets up the colour gradients used for background, text, etc
 */
function setupGradients(){
    backgroundNight = context.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);
    backgroundNight.addColorStop(0, "#000000");
    backgroundNight.addColorStop(0.7, "#090979");
    backgroundNight.addColorStop(1, "#0074ff");

    nightTextGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    nightTextGradient.addColorStop(0, "#FD1D1D");
    nightTextGradient.addColorStop(0.5, "#FCB045");
    nightTextGradient.addColorStop(1, "#FFFFFF");

    backgroundDay = context.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);
    backgroundDay.addColorStop(0, "#FD1D1D");
    backgroundDay.addColorStop(0.5, "#FCB045");
    backgroundDay.addColorStop(1, "#FFFFFF");

    dayTextGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    dayTextGradient.addColorStop("0", "#FF00FF");
    dayTextGradient.addColorStop("0.5", "#0000FF");
    dayTextGradient.addColorStop("1.0", "#FF0000");
}

/**
 * Draws up the menu screen with a title and buttons with the given colour set and word set
 * @param {Background Gradient Colour} backGradient 
 * @param {Text Gradient Colour} textGradient 
 * @param {Array/Set of Text to display} menuSet 
 */
function drawMenu(backGradient, textGradient, menuSet){
    //Background    
    context.fillStyle = backGradient;    
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    //Text
    context.strokeStyle = "Black";
    context.fillStyle = textGradient;

    //Title Text
    let textScale = canvas.height / 8;
    let font = textScale + "px Verdana";
    context.textAlign = "center";
    context.font = font;
    context.fillText(menuSet[0], canvas.width / 2, canvas.height / 6);

    //Outline
    context.strokeText(menuSet[0], canvas.width / 2, canvas.height / 6);

    //Button
    context.textAlign = "start";
    font = (textScale / 2) + "px Verdana";
    context.font = font;
    
    context.fillRect(canvas.width / 32, canvas.height / 2 + (4 * (canvas.height / 24)), canvas.width / 4, canvas.height / 24); //TOP
    context.fillText(menuSet[1], canvas.width / 32, canvas.height / 2 + (4 * (canvas.height / 24)));
    
    context.fillRect(canvas.width / 32, canvas.height / 2 + (7 * (canvas.height / 24)), canvas.width / 4, canvas.height / 24); //MIDDLE
    context.fillText(menuSet[2], canvas.width / 32, canvas.height / 2 + (7 * (canvas.height / 24)));
    
    context.fillRect(canvas.width / 32, canvas.height / 2 + (10 * (canvas.height / 24)), canvas.width / 4, canvas.height / 24); //BOTTOM
    context.fillText(menuSet[3], canvas.width / 32, canvas.height / 2 + (10 * (canvas.height / 24)));

    //Text Outline    
    context.strokeText(menuSet[1], canvas.width / 32, canvas.height / 2 + (4 * (canvas.height / 24)));
    context.strokeText(menuSet[2], canvas.width / 32, canvas.height / 2 + (7 * (canvas.height / 24)));
    context.strokeText(menuSet[3], canvas.width / 32, canvas.height / 2 + (10 * (canvas.height / 24)));

    //Controls
    context.textAlign = "end";
    font = (textScale / 3) + "px Verdana";
    context.font = font;
    context.fillText("↵ Select | ↑ Move Up | ↓ Move Down", canvas.width,  canvas.height / 2 + (11 * (canvas.height / 24)));

    //Special Case - Resolution
    if(menu == "settings" && curMenu == 1){
        context.textAlign = "start";
        font = (textScale / 2) + "px Verdana";
        context.font = font;
        
        context.fillText("[" + resolutionSet[resolutionSelect][0] + "x" + resolutionSet[resolutionSelect][1] + "]", (canvas.width / 32) + (canvas.width / 4), canvas.height / 2 + (7 * (canvas.height / 24)));
        context.strokeText("[" + resolutionSet[resolutionSelect][0] + "x" + resolutionSet[resolutionSelect][1] + "]", (canvas.width / 32) + (canvas.width / 4), canvas.height / 2 + (7 * (canvas.height / 24)));         

        context.fillText("↔", (canvas.width / 32) + (canvas.width / 4), canvas.height / 2 + (8 * (canvas.height / 24)));
    }
}

/**
 * Controls the menu
 */
function menuControl(){
    if(keys[81]){ // Q
        keys[81] = false;
        bgmSelect = (bgmSelect - 1 + bgmSet.length) % bgmSet.length;
        bgm.src = bgmDir + bgmSet[bgmSelect];
        bgm.play();
    }
    if(keys[69]){ // E
        keys[69] = false;
        bgmSelect = (bgmSelect + 1) % bgmSet.length;
        bgm.src = bgmDir + bgmSet[bgmSelect];
        bgm.play();
    }

    if(keys[87] || keys[38]){ // Up & W
        curMenu -= 1;
        buttonMove.pause();
        buttonMove.play();
    }
    else if(keys[83] || keys[40]){ // Down & S
        curMenu += 1;
        buttonMove.pause();
        buttonMove.play();
    }

    curMenu = ((curMenu % 3) + 3) % 3;

    if(keys[13]){ // Enter
        keys[13] = false;
        buttonSelect.pause();
        buttonSelect.play();
        switch(menu){
            case "mainMenu":
                switch(curMenu){
                    case 0: // Start
                        menu = "inGame";
                        break;
                    case 1: // Settings
                        menu = "settings";
                        curMenu = 0;
                        break;
                    case 2: // Credits
                        alert("「 BGM : MusMus 」\n「 SFX : MusMus & OtoLogic」\n");
                        break;
                    default:
                        alert("You broke it :)))))");
                        break;
                }
                break;
            case "settings":
                switch(curMenu){
                    case 0: // Controls
                        alert("Press ENTER to Begin/Select\nPress W to Accelerate\nPress S to Brake\nPress A / D to turn\nPress Q / E to switch Tracks\nPress ESC to pause");
                        console.log("Press ENTER to Begin/Select\nPress W to Accelerate\nPress S to Brake\nPress A / D to turn\nPress Q / E to switch Tracks\nPress ESC to pause");
                        break;
                    case 1: // Resolution
                        alert("Use Left and Right arrows keys to change your resolution");
                        break;
                    case 2: // Return
                        menu = "mainMenu";
                        curMenu = 0;
                        break;
                    default:
                        alert("You broke it :)))))");
                        break;
                }
                break;
        }
    }

    //Special Case - Resolutions
    if(menu == "settings" && curMenu == 1){
        if(keys[37] || keys[65]){ // Left
            keys[37] = keys[65] = false;
            resolutionSelect = (resolutionSelect - 1 + resolutionSet.length) % resolutionSet.length;
            canvas.width = resolutionSet[resolutionSelect][0];
            canvas.height = resolutionSet[resolutionSelect][1];
            scale = scaleSet[resolutionSelect];
            setupGradients();
        }
        else if(keys[39] || keys[68]){ // Right
            keys[39] = keys[68] = false;
            resolutionSelect = (resolutionSelect + 1) % resolutionSet.length;
            canvas.width = resolutionSet[resolutionSelect][0];
            canvas.height = resolutionSet[resolutionSelect][1];
            scale = scaleSet[resolutionSelect];
            setupGradients();
        }
    }
}

/**
 * Redraws the screen depending on the state of the game
 * Also restarts the animation for the buttons
 */
function redraw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    switch(menu){
        case "mainMenu": 
            drawMenu(backgroundDay, dayTextGradient, menuTextSet[0]); 
            animateMenu();
            break;
        case "settings": 
            drawMenu(backgroundNight, nightTextGradient, menuTextSet[1]);
            animateMenu();
            break;
        case "inGame":
            clearAll();
            gameInterval = setInterval(runGame, 60);
            break;
    }
}

/**
 * Changes the colour of the current button selected in a cycle
 */
function animateMenu(){
    menuColourSelect = (menuColourSelect + 1) % menuColour.length;
    context.fillStyle = menuColour[menuColourSelect];

    switch(curMenu){
        case 0: context.fillRect(canvas.width / 32, canvas.height / 2 + (4 * (canvas.height / 24)), canvas.width / 4, canvas.height / 24); break; //TOP
        case 1: context.fillRect(canvas.width / 32, canvas.height / 2 + (7 * (canvas.height / 24)), canvas.width / 4, canvas.height / 24); break; //MIDDLE
        case 2: context.fillRect(canvas.width / 32, canvas.height / 2 + (10 * (canvas.height / 24)), canvas.width / 4, canvas.height / 24); break; //BOTTOM
        default: alert("You broke it :)))))"); break;
    }
}

/**
 * Clears all intervals and sets a white screen
 */
function clearAll(){
    clearInterval(menuInterval);
    clearInterval(gameInterval);
    clearInterval(controlInterval);
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Clears all sounds
 */
function musicClear(){
    buttonMove.pause();
    buttonSelect.pause();
    bgm.pause();
    carMaxSpeed.pause();
    carRev.pause();
    carDecel.pause();
    carIdle.pause();
}




/*
###################################
###################################
###################################
###################################
###################################

        ^
        |
      Menu

      Game 
        |
        v

###################################
###################################
###################################
###################################
###################################
*/





/*
    Things to Add(?)
    - Curves
    - Hills
*/

/* 
    Reference
    http://www.extentofthejam.com/pseudo/
*/

//Start
function runGame(){
    //Car Behaviour
    handleCar();

    //Draw Road
    drawRoad();

    //Draw HUD
    context.fillStyle = "White";
    if(speed < 0){
        speed = 0;
    }
    
    let textScale = canvas.height / 16;
    let font = textScale + "px Verdana";
    context.font = font;
    context.textAlign = "left";
    context.fillText(parseInt(speed / 5) + "km/h", canvas.width / 16, canvas.height / 16);
    context.strokeStyle = "Black";
    context.strokeText(parseInt(speed / 5) + "km/h", canvas.width / 16, canvas.height / 16);

    context.textAlign = "right";
    context.fillText(parseInt(playerZ / 10 / 360) + "km Driven", canvas.width - (canvas.width / 16), canvas.height / 16);
    context.strokeStyle = "Black";
    context.strokeText(parseInt(playerZ / 10 / 360) + "km Driven", canvas.width - (canvas.width / 16), canvas.height / 16);
    

    //Draw Car
    if((keys[37] || keys[65]) && speed > 0){ //Arrow Left & A, Left Turn
        context.drawImage(carLeft, (canvas.width / 2) - (carLeft.width / 2), canvas.height - (carLeft.height * 5 / 6));
    }
    else if((keys[39] || keys[68]) && speed > 0){ //Arrow Right & D, Turn Right
        context.drawImage(carRight, (canvas.width / 2) - (carRight.width / 2), canvas.height - (carRight.height * 5 / 6));
    }
    else{ //Straight
        context.drawImage(carStraight, (canvas.width / 2) - (carStraight.width / 2), canvas.height - (carStraight.height * 5 / 6));
    }
}

/**
 * Handles the car behaviour
 */
function handleCar(){
    if(keys[81]){ // Q
        keys[81] = false;
        bgmSelect = (bgmSelect - 1 + bgmSet.length) % bgmSet.length;
        bgm.src = bgmDir + bgmSet[bgmSelect];
        bgm.play();
    }
    if(keys[69]){ // E
        keys[69] = false;
        bgmSelect = (bgmSelect + 1) % bgmSet.length;
        bgm.src = bgmDir + bgmSet[bgmSelect];
        bgm.play();
    }    

    let lastSpeed = speed;
    if(keys[38] || keys[87]){ //Arrow Up & W, Accelerate        
        speed += acceleration;
        playerZ += speed;
        if(speed > maxSpeed){
            speed = maxSpeed;
        }        
    }
    else if(keys[40] || keys[83]){ //Arrow Down & S, Deccelerate
        speed -= acceleration / 2;
        if(speed < 0){
            speed = 0;
        }
        playerZ += speed;
    }
    else{ //Natural Decceleration
        if(speed > 0){
            carDecel.play();
        }
        speed -= acceleration / 5;
        if(speed < 0){
            speed = 0;
        }
        playerZ += speed;
    }
    if(keys[37] || keys[65]){ //Arrow Left & A, Left Turn
        playerX -= speed / 3;
        if(playerX < (-2 * roadWidth)){
            playerX = -2 * roadWidth;
        }
    }
    else if(keys[39] || keys[68]){ //Arrow Right & D, Turn Right
        playerX += speed / 3;
        if(playerX > 2 * roadWidth){
            playerX = 2 * roadWidth;
        }
    }
    //Offroad behaviour
    if((playerX < (-1 * roadWidth  * 1.05) || (playerX > roadWidth  * 1.05))){
        if(maxSpeed > 300){
            maxSpeed -= (acceleration * 2);
        }
        speed -= acceleration / 2;
        if(speed < 0){
            speed = 0;
        }
    }
    else{
        maxSpeed = 1000;
    }

    //Car Audio
    carIdle.pause();
    carMaxSpeed.pause();
    carRev.pause();
    carDecel.pause();

    if(speed == maxSpeed){
        carRev.currentTime = carRev.duration * (speed / maxSpeed);
        carDecel.currentTime = carDecel.duration * (speed / maxSpeed);
        carMaxSpeed.volume = 0.7;
        carMaxSpeed.play();
    }
    else if(speed > lastSpeed){
        carDecel.currentTime = carDecel.duration * (speed / maxSpeed);
        carRev.play();
        if(speed + 50 > maxSpeed){
            carMaxSpeed.volume = 0.2;
            carMaxSpeed.play();
        }
    }
    else if(speed < lastSpeed){
        carRev.currentTime = carRev.duration * (speed / maxSpeed);
        carDecel.play();
    }
    else if(speed <= 0){
        carRev.currentTime = carRev.duration * (speed / maxSpeed);
        carDecel.currentTime = carDecel.duration * (speed / maxSpeed);
        carIdle.play();
    }
    else{
        carIdle.play();
    }
}

/**
 * Draws the grass, road border, and the road
 */
function drawRoad(){
    playerZ %= (roadLength * totalPaths);
    let playerPos = parseInt((playerZ / roadLength) + "");
    for(let i = playerPos; i < (playerPos + 500); i++){
        let colour = (i / 3) % 3;
        let grass, border, road;
        if(colour > 1){
            //grass = "#37C86B";
            grass = "#3e7f55";
            border = "#E2221D";
            road = "#768980";
        }
        else{
            //grass = "#5FD389";
            grass = "#5e9458";
            border = "#FFFFFF";
            road = "#98A191";
        }

        let curr = translateScreen(path[(i + totalPaths) % totalPaths], playerX, playerY + (canvas.height * 2), playerZ);
        let prev = translateScreen(path[(i - 1 + totalPaths) % totalPaths], playerX, playerY + (canvas.height * 2), playerZ);

        //Grass
        drawTrapezoid(grass, 0, prev[1], canvas.width, 0, curr[1], canvas.width);
        //Border
        drawTrapezoid(border, prev[0], prev[1] * 1.0015, prev[2] * 1.1, curr[0], curr[1], curr[2] * 1.1);
        //Road
        drawTrapezoid(road, prev[0], prev[1] * 1.003, prev[2], curr[0], curr[1], curr[2]);
    }

    //Background
    /*
        Covers the top half otherwise my road draws into the 4th dimension 
    */
    context.fillStyle = backgroundNight;
    context.fillRect(0, 0, canvas.width, (canvas.height / 2) + 15);

    //Sun
    context.fillStyle = backgroundDay;
    context.beginPath();
    let sunPos = (playerX / -32) + (canvas.width / 2);
    if(sunPos < 0){
        sunPos = 0;
    }
    if(sunPos > canvas.width){
        sunPos = canvas.width;
    }
    context.save();
    context.scale(1.2, 1);
    context.arc(sunPos / 1.2, canvas.height / -8, canvas.height / 4, 0, 2 * Math.PI);
    context.restore();
    context.fill();
}

/**
 * Generates a random varition of the paths (So just straights :)))))
 * @param {Total Amount of Paths} totalPaths 
 */
function generatePath(totalPaths){
    for(let i = 0; i < totalPaths; i++){
        path.push(new Road(0, 0, i * roadLength, 0, 0));
    }
}

/**
 * Analogy: Minecraft
 * Finds the coords for drawing on screen from 3D World
 * Think of camera as Player POV
 * The world itself does not move but the Camera/Player (Head) does
 * Screen is used for the Trapezoid, (x,y) pos and width of the road
 * & "sprite" scaling 
 * @param {3D World Cords, [x,y,z]} curPath  
 * @param {Camera Position X} camX 
 * @param {Camera Position Y} camY 
 * @param {Camera Position Z} camZ 
 */
function translateScreen(curPath, camX, camY, camZ){
    let scale = 1 / (curPath.z - camZ); //Distance (The further, the smaller the roads)
    let screenX = ((1 + (curPath.x - camX) * scale)) * (canvas.width / 2);
    let screenY = ((1 - (curPath.y - camY) * scale)) * (canvas.height / 2);
    let screenW = scale * roadWidth * canvas.width / 2;
    return [screenX, screenY, screenW];
}

/**
 * Draws trapezoid
 * @param {Colour of the Trapezoid} colour 
 * @param {Bottom X Pos} botX
 * @param {Bottom Y Pos} botY
 * @param {Width of Bottom} botWidth 
 * @param {Top X Pos} topX
 * @param {Top Y Pos} topY
 * @param {Width of Top} topWidth
 */
function drawTrapezoid(colour, botX, botY, botWidth, topX, topY, topWidth){
    context.fillStyle = colour;
    context.beginPath();
    context.moveTo(botX - botWidth, botY); // Bottom Left
    context.lineTo(topX - topWidth, topY); // Top Left
    context.lineTo(topX + topWidth, topY); // Top Right
    context.lineTo(botX + botWidth, botY); // Bottom Right
    context.fill();
}