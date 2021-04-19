function drawTest(){
    const test = canvas.height / 64;
    let maxHeight = canvas.height / 2;
    //Background - Grass
    context.fillStyle = "Green";
    context.fillRect(0, maxHeight, canvas.width, canvas.height);
    
    //Path
    let shrinkAmount = canvas.width / 64;
    let height = canvas.height / 48;
    let lineWidth = 25;
    let lengthShrink = 0;

    for(let i = 0; i < 250, (canvas.height - (height * i) > maxHeight); i++){
        lengthShrink += shrinkAmount;        
        //Draw paths
        context.fillStyle = "Black";
        
        //Add to left X, Minus to right X
        context.fillRect(lengthShrink, canvas.height - (height * i), canvas.width - (lengthShrink * 2), height);
    }

    context.strokeStyle = "Red";
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(0, canvas.height);
    context.lineTo(lengthShrink + (lineWidth / 2) + test, maxHeight - test);
    context.stroke();
    context.moveTo(canvas.width, canvas.height);
    context.lineTo(canvas.width - lengthShrink - (lineWidth / 2) - test, maxHeight - test);
    context.stroke();

    //Background - Sun
    context.fillStyle = backgroundDay;
    context.fillRect(0, 0, canvas.width, maxHeight + height);
}

let lastTime = 0;
function gameLoop(timestamp){
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    context.clearRect(0, 0, canvas.width, canvas.height);

    updateGame();

    //requestAnimationFrame(gameLoop); or outisde: setInterval(gameLoop, 30, 0);
}

function oldMenuControl(event){

    //console.log("Current Key Press: " + event.keyCode);
    event.preventDefault();
    switch(event.keyCode){
        case 87: // W
        case 38: // Up
            buttonMove.pause();
            buttonMove.ended = true;
            curMenu -= 1;
            buttonMove.play();
            break; 
        case 83: // S
        case 40: // Down
            curMenu += 1;
            buttonMove.pause();
            buttonMove.ended = true;
            buttonMove.play();
            break;
        case 13: // Enter
            buttonSelect.pause();
            buttonSelect.ended = true;
            buttonSelect.play();
            switch(menu){
                case "inMain":
                    switch(curMenu){
                        case 0: // Start
                            menu = "Let It Go by Idina Menzel";
                            break;
                        case 1: // Settings
                            menu = "inSettings";
                            curMenu = 0;
                            break;
                        case 2: // Controls
                            alert("Press ENTER to Begin/Select\nPress W to Accelerate\nPress S to Brake\nPress A / D to turn\nPress ESC to pause");
                            break;
                        default:
                            break;
                    }
                    break;
                case "inSettings":
                    switch(curMenu){
                        case 0: // Audio
                            alert("Audio");
                            console.log("Audio");
                            break;
                        case 1: // Resolution
                            resolutionSelect = (resolutionSelect + 1) % resolutionSet.length;
                            canvas.width = resolutionSet[resolutionSelect][0];
                            canvas.height = resolutionSet[resolutionSelect][1];
                            scale = scaleSet[resolutionSelect];
                            alert("Resolution - " + canvas.width + ":" + canvas.height);
                            console.log("Resolution - " + canvas.width + ":" + canvas.height);
                            break;
                        case 2: // Return
                            menu = "inMain";
                            curMenu = 0;
                            console.log("Return");
                            break;
                        default:
                            break;
                    }
                    break;
                default: break;        
            }
            break;
        case 27: // Esc
            break;
        default:
            break;
    }
    curMenu = ((curMenu % 3) + 3) % 3;
    //console.log("Current Menu Selection: " + curMenu);
    redraw();
}

function oldUpdateGame(){
    let ddz = 4;
    let dz = z = 0;
    for(let i = 0; i < 150; i++){
        let nextPath = path[i + 1] % path.length;
        drawRoad(i % 2 == 0, );
    }
}

function oldGenerateRoad(){
    while(path.length < 500){
        path.push
    }
}

//drawRoad(0, 0, 0);
function oldRenderGame(){
    //Background - Sun & Clears the screen
    context.fillStyle = backgroundDay;
    context.fillRect(0, 0, canvas.width, canvas.height);  

    drawRoad(canvas.height, 0, 0, 5, 0);
}

const growthRate = 40;
function oldDrawRoad(lastHeight, lastOffset, count, drawColours, growth){
    console.log("~~~~~~~~~~~~~~~");
    console.log(growth);
    console.log("~~~~~~~~~~~~~~~");


    //Max height = half the screen
    growth += growthRate;
    let maxHeight = canvas.height / 2;
    count += 1;
    //Draw until half of the canvas
/*
    if(lastHeight > maxHeight){
        //Draw Car
        if(leftPressed){
            //Draw car facing left
        }
        else if(rightPressed){
            //Draw car facing right
        }
        else{
            //Draw car facing center        
        }

        //End
        return;
    }
*/
    //Emergency Break
    if(count == 5){
        return;
    }

    //Colour Switches
    let grass, border, road;
    if(drawColours > 1){
        //Darker
        grass = "#0E4F05";
        border = "#3C403C";
        road = "#3C403C";
        //line = "#EDF1ED";
    }
    else{
        //Lighter
        grass = "#1C9D0B";
        border = "#EDF1ED";
        road = "#798078";
        //line = "#798078";
    }

    //Calculate Trapezoid Height & Offset
    let height = (lastHeight - 50) + (growth * count / 16); 
    let offset = (lastOffset + 50);  

    /*
    console.log("grass: " + grass);
    console.log("lastHeight: " + lastHeight);
    console.log("lastOffset: " + lastOffset);
    console.log("height: " + height);
    console.log("offset: " + offset);
    */  

    //Background Grass
    //drawTrapezoid(grass, lastHeight, height, lastOffset, offset);
    context.fillStyle = grass;
    //context.fillRect(0, lastHeight, canvas.width, height - lastHeight);

    //Draw Road
    //drawTrapezoid(border, lastHeight, height, lastOffset, offset);
    OldDrawTrapezoid(road, lastHeight, height, lastOffset + 50, offset + 50, count);

    drawRoad(height, offset, count, ((-1) * drawColours), growth);
}

function OldDrawTrapezoid(colour, yBot, yTop, prevX, xOffset, xScale){
    let roadWidth = canvas.width / 2;

    console.log("- - - - - - - - - - - - - ");
    console.log("yBot: " + yBot);
    console.log("yTop: " + yTop);
    console.log("prevX: " + prevX);
    console.log("xOffset: " + xOffset);
    console.log("- - - - - - - - - - - - - ");

    context.fillStyle = colour;
    context.beginPath();
    context.moveTo(prevX , yBot); // Bottom Left
    context.lineTo(xOffset, yTop); // Top Left
    context.lineTo((roadWidth / xScale) + (2 * xOffset), yTop); // Top Right
    context.lineTo(canvas.width - prevX, yBot); // Bottom Right
    context.fill();
}
