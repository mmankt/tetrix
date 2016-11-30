/*

Tetrix - a Tetris clone assigment for a JS developer candidate in Yggdrasil
@author Wojciech Milowski w@milowski.eu
Developed in brackets with pixi.js.
Playable with keyboard and touch 
Tested and working in latest ff , chrome ,android chrome and ipad's safari.
Had limited time on monday/tuesday evenings.

*/

var gameIsOver=false,welcome=true,paused=false;

var score = 0;
//size of the individual cell/brick
var gridSize = new Vector2(25,25);
//size of the playfield
var gridRes = new Vector2(10,20);

var playfield = new Array(gridRes.x*gridRes.y);
//our falling tetromino and next in line
var currentElement=null, nextElement=null;

//setup rendering
var renderer = PIXI.autoDetectRenderer(360, 640);

//using kittykatattack's helpers for pointer interactions 
var tink = new Tink(PIXI,renderer.view);
var pointer = tink.makePointer();
 
//control buttons for touch input
var upButton,downButton, leftButton, rightButton; 

document.body.appendChild(renderer.view);
  
var stage = new PIXI.Container(0x00000,true);

//kittykatattack's helpers for game scaling
let scale = scaleToWindow(renderer.view);
window.addEventListener("resize", event => {
    scale=scaleToWindow(renderer.view);
});

//should the tetroimino go faster
let faster = false;
//'time' in frames between each tetroimino step assuming 60fps 
let currInterval=0,interval=40;

//holds sprites and thir positions on the playfield
var playfieldShapes = new Array(gridRes.x*gridRes.y);

//inputs
var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40),
      pause = keyboard(80),
    space = keyboard(32);

//input handling
space.release = function()
{
    if(welcome)
    {
        welcome = false;
        stage.removeChildren();
        startPlaying();
    }
    
    else if(gameIsOver)
    {
        stage.removeChildren();
        init();
        gameIsOver = false;
    }
}

pause.release = function()
{
    if(!gameIsOver && !welcome)
    {
        paused = !paused;
    }
}

pointer.tap = () =>
{ 
    if(!gameIsOver&&!paused&&!welcome)
    {
        if(testButton(upButton)){up.release();}
        else if(testButton(downButton)){currentElement.goDown();}//different from kb controls since it's a tap
        else if(testButton(leftButton)){left.release();}
        else if(testButton(rightButton)){right.release();}
    }
    
    space.release(); 
}

//most basic point inside aabb test 
function testButton(b)
{
    if(pointer.x>=b.position.x*scale&&pointer.x<=(b.position.x+20*b.scale.x)*scale&&pointer.y>=(b.position.y)*scale&&pointer.y<=(b.position.y+20*b.scale.y)*scale){return true;}
    else return false;
}

left.release = function()
{
    currentElement.goLeft();
}

right.release = function()
{
    currentElement.goRight();
}

up.release = function()
{
    currentElement.rotate();
}

down.press = function()
{
    faster=true;
}

down.release = function()
{
    faster = false;
}

//initialize rendering
render();
gameStart();
  
function render()
{
    requestAnimationFrame(render);
    
    pointer.x = pointer.x / scale;
    pointer.y = pointer.y / scale;
    
    tink.update();
    
    if(!gameIsOver && !welcome && !paused){update();}
    
    renderer.render(stage);
}

function startPlaying()
{
    score=0;
    init();
}

//main update loop 
function update()
{
   //this is tetris so we dont bother with time based updates and don't want to jump in time when something hitches... 
    //render all tiles...
   currInterval++;
    /*
    if(left.isDown) {currentElement.goLeft(); }
       if(right.isDown) {currentElement.goRight(); }
       if(up.isDown) {currentElement.rotate(); }
    */
   //tetrominos go down every interval or half if down is pressed
   if(currInterval==interval || (faster && currInterval>interval/10) )
   {
       currInterval=0;
       
       currentElement.goDown();
   }
}

function init()
{
    //draw the playfield background
    
    for(let y=0;y<gridRes.y;y++){
        for(let x=0;x<gridRes.x;x++){
            
        let box = new PIXI.Graphics();
            let color = 0xd1d1d1;
            if(x%2==0 && y%2!=0) {color = 0x898989;}      
            else if(x%2!=0 && y%2==0) {color = 0x898989;}

            box.beginFill(color);
            box.drawRect(0,0,gridSize.x,gridSize.x);
            box.position.set(x*gridSize.x,y*gridSize.x);
            stage.addChild(box);
    
            }
    }
    
    //reset the playfield array
    for(let i = 0;i<playfield.length;i++)
    {
        playfield[i]=0;
    }
    
    //add buttons for mobile controls
    addButtons();
    
    //initialize new tetromino
    this.requestNewTetromino();
}

function requestNewTetromino()
{
    currInterval = 0;
        
    let mr2 = Math.round(Math.random()*6)+1;
    
    if(currentElement==null)
    {
        let mr = Math.round(Math.random()*6)+1;
        currentElement = new Tetromino(mr);
        currentElement.draw();
    }
    
    else 
    {   
        //since the next element is already in the previev we just corrrect the position to the initial one and move the gfx by the difference
        currentElement = nextElement;
        currentElement.resetPosition();
        //check for filled lines
        rowTest();
    }
    
    //make sure the next one isnt the same as current
    while(mr2==currentElement.type)
    {
        mr2 = Math.round(Math.random()*6)+1;
    }
    
    nextElement = new Tetromino(mr2);
    //this gives a preview of next element
    nextElement.position.set(10.5,1);
    nextElement.draw();
}

//check if any rows are filled
function rowTest()
{
    let rowRemoved=0;
    
        for(let y = gridRes.y-1;y>=0;y--)
        {
            //was a full row detected
            let full = true;
            //was a fully clear row detected meaning that there are no more upward elements on the playfield
            let allFree = true;

            for(let x = gridRes.x-1;x>=0;x--)
            {
                if(playfield[x+y*gridRes.x]!=0) {allFree=false;}
                if(playfield[x+y*gridRes.x] == 0) {full = false;}
            }
            
            //no need to go on if a row was free
            if(allFree) { break; finished=true; }
            
            //remove a full row
            if(full)
            {
                score+=10;
                
                rowRemoved=y;
                
                for(let x2 = gridRes.x-1;x2>=0;x2--)
                {
                    playfield[x2+y*gridRes.x]=0;                     
                    stage.removeChild(playfieldShapes[x2+y*gridRes.x]);
                    playfieldShapes[x2+y*gridRes.x]=undefined; 
                }
                
                //move all the elements downwards by one
                for(let y3 = rowRemoved-1;y3>=0;y3--)
                {
                    for(let x3 = gridRes.x-1;x3>=0;x3--)
                    {
                        playfield[x3+(y3+1)*gridRes.x]=playfield[x3+y3*gridRes.x];
                        playfield[x3+y3*gridRes.x]=0;   
                        
                        if(playfieldShapes[x3+(y3)*gridRes.x]!=undefined)
                        {
                            playfieldShapes[x3+(y3)*gridRes.x].position.y+=gridSize.y;
                            playfieldShapes[x3+(y3+1)*gridRes.x]=playfieldShapes[x3+(y3)*gridRes.x];

                            playfieldShapes[x3+(y3)*gridRes.x]=undefined;
                        }
                        
                    }
                }
                
                //correct the search by the removed row;
                y+=1;
                
            }
                
        }
    
    
    //}
}

//remove everything from the play screen
function cleanUp()
{
    if(currentElement!=null){currentElement.reset();
    currentElement = null;}
    if(nextElement!=null){nextElement.reset();
    nextElement=null;}
    
    stage.removeChildren();
    
    this.playfield = new Array(gridRes.x*gridRes.y);
    this.playfieldShapes = new Array(gridRes.x*gridRes.y);
    
}

//display the game over screen
function gameOver()
{
    gameIsOver=true;
    
    cleanUp();
    
    var text = new PIXI.Text('GAME OVER',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
    text.position.set(180,300);
    text.position.x-=text.width/2;
    stage.addChild(text);
    
    var text3 = new PIXI.Text('Your score was: '+score,{fontFamily : 'Arial', fontSize: 18, fill : 0xffffff, align : 'center'});
    text3.position.set(180,350);
    text3.position.x-=text3.width/2;
    stage.addChild(text3);
    
        
    var text2 = new PIXI.Text('Press space/tap to restart',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
    text2.position.set(180,390);
    text2.position.x-=text2.width/2;  
    
    stage.addChild(text2);
    
}

//display the welcome screen
function gameStart()
{
    gameIsOver=false;
    welcome = true;
    
    var text = new PIXI.Text('TETRIX',{fontFamily : 'Arial', fontSize: 50, fill : 0xffffff, align : 'center'});
    text.position.set(180,250);
    text.position.x-=text.width/2;
    stage.addChild(text);
    
        
    var text2 = new PIXI.Text('Press space/tap to start. \n\n Use arrows for controls. \n\n Good luck!',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
    text2.position.set(180,340);
    text2.position.x-=text2.width/2;  
    
    stage.addChild(text2);
    
}

//add touch buttons
function addButtons()
{
    //left arrow
    let box;
    leftButton =  box = new PIXI.Graphics();
            let color = 0xd1d1d1;
            box.beginFill(color);
    
            box.moveTo(0,5);
            box.lineTo(5,0);
            box.lineTo(5,10);
            box.lineTo(0,5);
            box.endFill();
            box.position.set(2*gridSize.x-5,22*gridSize.y-10);
            stage.addChild(box);
            box.scale.x = box.scale.y = 4;
                
            //right arrow
            rightButton = box = new PIXI.Graphics();
                
            box.beginFill(color);
                
            box.moveTo(0,0);
            box.lineTo(5,5);
            box.lineTo(0,10);
            box.lineTo(0,0);
            box.endFill();
            box.position.set(12*gridSize.x-5,22*gridSize.y-10);
            box.scale.x = box.scale.y = 4;
                    stage.addChild(box);
            //down arrow
            downButton = box = new PIXI.Graphics();
                        
            box.beginFill(color);
    
            
            box.moveTo(0,0);
            box.lineTo(10,0);
            box.lineTo(5,5);
            box.lineTo(0,0);
            box.endFill();
            box.position.set(5*gridSize.x-5,22*gridSize.y+5);
            box.scale.x = box.scale.y = 4;
            stage.addChild(box);
    
            //up arrow
            upButton = box = new PIXI.Graphics();
            
            

            box.beginFill(color);
    
            box.drawCircle(5,5,10);
            box.endFill();
            box.position.set(9*gridSize.x-5,22*gridSize.y);
            box.scale.x = box.scale.y = 1.5;
            stage.addChild(box);
   }

//input handler from pixi.js kittykatattack's pixi helpers 
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}