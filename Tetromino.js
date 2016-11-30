//tetromino types: i = 1, j = 2, l=3, o=4, s=5, z=6, t=7;


//Tetrominos are stored as a 4x4 matrix in a 1d array for efficiency
//They manage their movemnts in goleft goright rotate and godown functions 
//
//Instead of changing indexes to positions or positions to indexes it could be wrapped in a function ex.: playfield[tx+1+(ty)*gridRes.x] -> playfieldPositionToIndex(x,y){return x+(y)*gridRes.x;} and the other way but had no time to change it 

var Tetromino = function(type){
    
    this.type = type;
    //the position is an array index on the playfield array, anchor being 0,0 in local 4x4 shape array
    this.position  = new Vector2(3,-1);
    this.color = 0x000000;
    //this stores the current shape
    this.shape = new Array(16);
    //individual sprites
    this.shapes = new Array();
    this.rotation=0;
    
    for(let i =0;i<16;i++)
    {
        this.shape[i]=0;
    }
    
    //third 'piece' of a tetromino is the rotation's center, need to track it's index in the shape array
    let thirdElement = 0;
    let elements = 0;
    
    //this function adds pieces of the teromino to an 1d array in a convinient way
    this.addElement = function(x,y)
    {
        //magical 4 cuz 4x4 matrix
        let i = x+y*4;
        this.shape[i] = this.type; 
        
        elements++;
        
        if(elements==3){thirdElement=i;}
           
    }
    
    //reset the tetromino position so its on the playfield's center
    this.resetPosition = function()
    {
        this.position.set(3,-1);
        if(this.type == TetrominoType.I){this.position.y-=1;}
        
        this.shapes.forEach((e,i,a)=>{e.position.x-=7.5*gridSize.x;e.position.y-=2*gridSize.y;if(this.type == TetrominoType.I){e.position.y-=1*gridSize.y;}})
    }
    
        
    switch(this.type)
    {
        //place the pieces in the '4x4' array
        case TetrominoType.I:
            this.addElement(0,2);
            this.addElement(1,2);
            this.addElement(2,2);
            this.addElement(3,2);
            this.color = 0x00FFFF;
            this.position.y-=1;
        break;
            
        case TetrominoType.J:
            this.addElement(0,1);
            this.addElement(0,2);
            this.addElement(1,2);
            this.addElement(2,2);
            this.color = 0x0000FF;
            
        break;
            
        case TetrominoType.L:
            this.addElement(2,1);
            this.addElement(0,2);
            this.addElement(1,2);
            this.addElement(2,2);
            this.color = 0xFF8040;
        break;
            
        case TetrominoType.O:
            this.addElement(1,1);
            this.addElement(2,1);
            this.addElement(1,2);
            this.addElement(2,2);
            this.color = 0xFFFF00;
        break;
            
        case TetrominoType.S:
            this.addElement(2,1);
            this.addElement(1,1);
            this.addElement(1,2);
            this.addElement(0,2);
            this.color = 0x01F70;
        break;
            
        case TetrominoType.T:
            this.addElement(1,1);
            this.addElement(0,2);
            this.addElement(1,2);
            this.addElement(2,2);
            this.color = 0x800080;
        break;
            
        case TetrominoType.Z:
            this.addElement(0,1);
            this.addElement(1,1);
            this.addElement(1,2);
            this.addElement(2,2);
            this.color = 0xFF000;
        break;
            
    }
    
    //draw the tetromino pieces
    this.draw = function()
    {
        for(let i=0;i<16;i++)
        {
            if(this.shape[i]!=0)
            {
                let box = new PIXI.Graphics();
                                
                box.beginFill(this.color);
                box.lineStyle(2,0x00000);
                box.drawRoundedRect(0,0,gridSize.x,gridSize.x,5);
                let ty = Math.floor(i/4);
                let tx = i-ty*4;
                box.position.set((this.position.x+tx)*gridSize.x,(this.position.y+ty)*gridSize.y);

                stage.addChild(box);
                this.shapes.push(box);
            }
        }
    }
    
    
    
    this.rotate = function()
    {
        //special case for I cuz it's only got 2 states - had a bug with it and no time to debug so this was faster and gets the job done 
        
        if(this.type==TetrominoType.I)
        {
            let tshape;
            
            if(this.rotation==90)
            {
                tshape = [0,0,0,0,
                              0,0,0,0,
                              this.type,this.type,this.type,this.type,
                              0,0,0,0];
                this.rotation=0;
                
            }
            
            else if(this.rotation==0)
            {
                tshape =
                    [0,0,this.type,0,
                     0,0,this.type,0,
                     0,0,this.type,0, 
                     0,0,this.type,0];
                this.rotation=90;
            }
            
            for(let i=0;i<16;i++)
            {
                if(tshape[i]!=0  )
                {
                    let yp = Math.floor(i/4);
                    let xp = i-yp*4;
                    let ni = this.position.x+xp+(this.position.y+yp)*gridRes.x;
                    
                    if(ni<0||ni>=gridRes.x*gridRes.y||this.position.x+xp>=gridRes.x ||this.position.x+xp<0||this.position.y+yp>=gridRes.y||this.position.y+yp<0 || playfield[ni]!=0 ) 
                    {return;}
                }
            }
            
            this.shape=tshape;
            let shapeNum2=0;
            for(let i=0;i<16;i++)
            {
                if(this.shape[i]!=0  )
                {
                    shapeNum2+=1;
                    let ty = Math.floor(i/4);
                    let tx = i-ty*4;
                    this.shapes[shapeNum2-1].position.set((this.position.x+tx)*gridSize.x,(this.position.y+ty)*gridSize.y);
                    if(shapeNum2==4){break;}
                }
            }
        }
        
       else if(this.type!=TetrominoType.O)
       {
            let shapeNum=0;
            //define the rotation center
            let rcy = Math.floor(thirdElement/4);
            let rcx = thirdElement-rcy*4;
            
            //new positions go into a temp array so we dont change the actual array while looping through it
            let tempShapes = new Array(16);

            for(let t=0;t<16;t++)
            {
                tempShapes[t]=0;    
            }
        
            for(let i=0;i<16;i++)
            {
                if(this.shape[i]!=0  )
                {
                                           //
                    shapeNum+=1;
                    //change the index to array position
                    let ty = Math.floor(i/4);
                    let tx = i-ty*4;
                    ty-=rcy;
                    tx-=rcx;

                    let angle =90* Math.PI / 180;
                    //new x y in the local array                                        
                    let xp = (tx * Math.cos(angle) - ty * Math.sin(angle))+rcx;
                    let yp = (tx * Math.sin(angle) + ty * Math.cos(angle))+rcy;
                    
                    //check if the rotated element isnt going to collide with anything or go out of the playfield bounds
                    //new index
                    let ni = this.position.x+xp+(this.position.y+yp)*gridRes.x;
                        
                                        
                    if(ni<0||ni>=gridRes.x*gridRes.y||this.position.x+xp>=gridRes.x ||this.position.x+xp<0||this.position.y+yp>=gridRes.y||this.position.y+yp<0 || playfield[ni]!=0 ) {return;}
                    //set the element in  
                    tempShapes[xp+yp*4]=this.type;

                }

            }
        
            this.shape = tempShapes;
            this.rotation+=90;
            shapeNum=0;
            //another loop to reposition the gfx after succesful rotation
            //could store the element indexes to not loop through shape array each time but its small so not that important 
            for(let i=0;i<16;i++)
            {
                if(this.shape[i]!=0 )
                {
                    shapeNum+=1;
                    let ty = Math.floor(i/4);
                    let tx = i-ty*4;
                    this.shapes[shapeNum-1].position.set((this.position.x+tx)*gridSize.x,(this.position.y+ty)*gridSize.y);
                    if(shapeNum==4){break;}
                }
            }
        }
    }
    
    this.goLeft=function()
    {
        
        //check if we can go right
        for(let s=0;s<this.shape.length;s++)
        {
            if(this.shape[s]!=0)
            {
            //local positions
            let ty = Math.floor(s/4);
            let tx = s-ty*4;
                //find the furthest elements to the left in local tetromino space
            if(tx==0||this.shape[tx-1]==0)
                {
                    //check if the playfield's areas 'to the left' are free
                    let px = this.position.x+tx;
                    ty+=this.position.y;
                        tx+=this.position.x;
                    
                    if(px==0||playfield[tx-1+(ty)*gridRes.x]!=0)
                    {
                        
                        //cant go
                        return;
                    }
                }
            
            }
        }
                
            this.position.x-=1;
            
            for(let i =0;i<this.shapes.length;i++)
            {
                this.shapes[i].position.x -=1*gridSize.x;   
            }
        
    }
    
    this.goRight=function()
    {
        
        //check if we can go right
        for(let s=0;s<this.shape.length;s++)
        {
            if(this.shape[s]!=0)
            {
            //local positions
            let ty = Math.floor(s/4);
            let tx = s-ty*4;
                //find the furthest elements to the right in local tetromino space
            if(tx==3||this.shape[tx+1]==0)
                {
                    //check if the playfield's areas 'to the right' are free
                    let px = this.position.x+tx;
                    ty+=this.position.y;
                    tx+=this.position.x;
                    if(px==gridRes.x-1||playfield[tx+1+(ty)*gridRes.x]!=0)
                    {
                        return;
                    }
                }
            
            }
        }
        
        
            this.position.x+=1;
            for(let i =0;i<this.shapes.length;i++)
                {
                    this.shapes[i].position.x +=1*gridSize.x;   
                }
        
    }
    
    this.goDown = function()
    {
        
        //check if we can go down
        for(let s=0;s<this.shape.length;s++)
        {
            if(this.shape[s]!=0)
            {
            //local positions
            let ty = Math.floor(s/4);
            let tx = s-ty*4;
                //find the lowest elements in local tetromino space
            if(ty==3||this.shape[ty+1]==0)
                {
                    //check if the playfield's lower areas are free
                    let py = this.position.y+ty;
                    
                    ty+=this.position.y;
                    tx+=this.position.x;
                                        
                    if(py==gridRes.y-1||playfield[tx+(ty+1)*gridRes.x]!=0)
                        {
                            
                            
                            //add the tetromino's data to the playfield and destroy this object  
                            this.addToPlayfield();
                            
                            
                            if(this.position.y<0){console.log("game over, score is: "+score); gameOver(); return;}
                            requestNewTetromino();
                            this.reset();
                            return;
                        }
                }
            
            }
        }
        
        
            this.position.y+=1;
            for(let i =0;i<this.shapes.length;i++)
                {
                    this.shapes[i].position.y +=1*gridSize.x;   
                }
        
    }
    
    //adds the tetroimino and its gfx to the playfield
    this.addToPlayfield = function ()
    {
        shapeNum=0;
            
            for(let i=0;i<16;i++)
            {
                if(this.shape[i]!=0  )
                {
                    shapeNum+=1;
                    let ty = Math.floor(i/4);
                    let tx = i-ty*4;
                    ty+=this.position.y;
                    tx+=this.position.x;
                    playfield[tx+(ty)*gridRes.x]=this.type;
                    playfieldShapes[tx+(ty)*gridRes.x]=this.shapes[shapeNum-1];
                    if(shapeNum==4){break;}
                    
                }
            }
    }
    
    //reset the tetromino
    this.reset = function()
    {
        this.shape = null;
        this.shapes = null;
        this.position = null;
    }
             
}


var TetrominoType = {
    I:1,
    J:2,
    L:3,
    O:4,
    S:5,
    Z:6,
    T:7
}


