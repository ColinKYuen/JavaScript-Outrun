function drawMainMenu(){ //Draws Menu
    //Background    
    context.fillStyle = backgroundDay;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    //Gradients
    context.strokeStyle = dayTextGradient;
    context.fillStyle = dayTextGradient;

    context.textAlign = "center";
    context.font = "60px Verdana";
    context.fillText("JavaScript OutRun", canvas.width / 2, 100);

    //"Buttons" to go through menu
    context.textAlign = "start";
    context.font = "30px Verdana";

    context.fillRect(10, 325, 200, 10); //TOP
    context.strokeText("Start", 10, 325);
    context.fillRect(10, 385, 200, 10); //MIDDLE
    context.strokeText("Setting", 10, 385);
    context.fillRect(10, 445, 200, 10); //BOTTOM
    context.strokeText("Controls", 10, 445);
}

function drawSettings(){ //Draws Settings Menu
    //Background
    context.fillStyle = backgroundNight;
    context.fillRect(0, 0, canvas.width, canvas.height);

    //Gradients
    context.strokeStyle = nightTextGradient;
    context.fillStyle = nightTextGradient;

    context.textAlign = "center";
    context.font = "60px Verdana";
    context.fillText("JavaScript OutRun", canvas.width / 2, 100);

    //"Buttons" to go through menu
    context.textAlign = "start";
    context.font = "30px Verdana";

    context.fillRect(10, 325, 200, 10); //TOP
    context.strokeText("Audio", 10, 325);
    context.fillRect(10, 385, 200, 10); //MIDDLE
    context.strokeText("Graphics", 10, 385);
    context.fillRect(10, 445, 200, 10); //BOTTOM
    context.strokeText("Return", 10, 445);
}

function updatePath(){
    const shrinkAmount = 4;
    const height = 4;
    let lengthShrink = 0;
    for(let i = 0; i < 75; i++){
        lengthShrink += shrinkAmount;
        //Draw paths
        //Colour of Path
        if(pathColour > 0){
            context.fillStyle= "Black"; //Black
        }
        else{
            context.fillStyle = "Grey"; //Grey
        }
        pathColour *= -1;
        
        //Add to left X, Minus to right X
        context.fillRect(lengthShrink, canvas.height - (height * i * 2), canvas.width - (lengthShrink * 2), height * i);
    }
}