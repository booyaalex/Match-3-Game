const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let gridSize = 10;
var board = {
	width: canvas.width,
  height: canvas.height
};
var symbols = {
	width: board.width / gridSize,
  height: board.height / gridSize,
  symbolArray: []
};
var logic = {
	keys: [],
  score: 0,
  grid: [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	mouseX: 0,
  mouseY: 0
};  

window.onload = () => {
	canvas.width = board.width;
  canvas.height = board.height;

	document.body.addEventListener("mousedown", function(e) {
		mouseDown(e);
	});
	document.body.addEventListener("mousemove", function(e) {
		mouseMove(e);
	}); 
	document.body.addEventListener("mouseup", function(e) {
		mouseUp(e);
	}); 
	setupGame();
	
	requestAnimationFrame(update);
};

function setupGame() {
  for(let row = 0; row < gridSize; row++) {
  	for(let column = 0; column < gridSize; column++) {
  		makeSymbol(randomNumber(6) + 1, row, column);
 	 	}
  }
}

//Runs Every Frame to Update the Game
function update() {
  requestAnimationFrame(update);
  ctx.clearRect(0, 0, board.width, board.height);
  drawBackground();
  
  for(const symbol of symbols.symbolArray) {
    drawSymbol(symbol);
    
    if(symbol.yPos < 9) {
    	if(logic.grid[symbol.xPos][symbol.yPos + 1] == 0) {
      	logic.grid[symbol.xPos][symbol.yPos] = 0;
        logic.grid[symbol.xPos][symbol.yPos + 1] = symbol.type;
        
        symbol.yPos++;
        symbol.y = symbol.yPos * symbols.height;
      }
    }
  }
  
  checkForMatch().then((foundMatch) => {
  	if(!foundMatch) {
    	for(const row of logic.grid) {
    		if(row.includes(0)) {
    			dropTheSymbols();
          break;
    		}
    	}
    }
  });
  
  document.getElementById("score").innerHTML = `Score: ${logic.score}`;
}

//This Function Draws the Grid Background
function drawBackground() {
	ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  for (let i = 0; i < gridSize; i++){
  	ctx.beginPath();
    ctx.moveTo(0, (board.height / gridSize) * i - 1);
    ctx.lineTo(board.width, (board.height / gridSize) * i - 1);
    ctx.closePath();
    ctx.stroke();
  }
  for (let i = 0; i < gridSize; i++){
  	ctx.beginPath();
    ctx.moveTo((board.width / gridSize) * i - 1, 0);
    ctx.lineTo((board.width / gridSize) * i - 1, board.height);
    ctx.closePath();
    ctx.stroke();
  }
}

//This Funciton Draws the Symbols on the Canvas
function drawSymbol(symbol) {
	ctx.beginPath();
  ctx.lineWidth = 5;
	if(symbol.type == 1) {
		ctx.fillStyle = "red";
	}
  else if (symbol.type == 2) {
  	ctx.fillStyle = "blue";
  }
  else if (symbol.type == 3) {
  	ctx.fillStyle = "green";
  }
  else if (symbol.type == 4) {
  	ctx.fillStyle = "purple";
  }
  else if (symbol.type == 5) {
  	ctx.fillStyle = "orange";
  }
  else if (symbol.type == 6) {
  	ctx.fillStyle = "yellow";
  }
  ctx.fillRect(symbol.x + 2, symbol.y + 2, symbols.width - 6, symbols.height - 6);
  ctx.closePath();
}

//The Function Creates a Symbol Object and Stores it into symbols.symbolArray
function makeSymbol(type, x, y) {
	const symbol = {
  	type: type,
    x: x * symbols.width,
    y: y * symbols.height,
    xPos: x,
    yPos: y,
    selected: false
  };
  logic.grid[x][y] = type;
  symbols.symbolArray.push(symbol);
}

//This Function Gets the Position of a Symbol
function getPosition(symbol) {
	ctx.beginPath();
  	ctx.rect(symbol.x + 2, symbol.y + 2, symbols.width - 6, symbols.height - 6);
    ctx.closePath();
}

//Get a Symbol From a Pair of Coordinates
function getSymbolFromPos(xPos, yPos) {
	return symbols.symbolArray.find((obj) => obj.xPos == xPos && obj.yPos == yPos);
}

//This Function Removes a Symbol From symbols.symbolArray that has a specified set of coordinates
function removeSymbolFromPos(xPos, yPos) {
	let pos;
	pos = symbols.symbolArray.indexOf(getSymbolFromPos(xPos, yPos));
  symbols.symbolArray.splice(pos, 1);
  logic.grid[xPos][yPos] = 0;
}

//This Function Swaps the Positions of two Symbols
function swapSymbols(symbol1, symbol2) {
	const placeholder = {
    xPos: symbol1.xPos,
    yPos: symbol1.yPos
  };
  
  logic.grid[symbol2.xPos][symbol2.yPos] = symbol1.type;
  symbol1.xPos = symbol2.xPos;
  symbol1.x = symbol2.xPos * symbols.width;
 	symbol1.yPos = symbol2.yPos;
  symbol1.y = symbol2.yPos * symbols.height;
  
  logic.grid[placeholder.xPos][placeholder.yPos] = symbol2.type;
  symbol2.xPos = placeholder.xPos;
  symbol2.x = placeholder.xPos * symbols.width;
 	symbol2.yPos = placeholder.yPos;
  symbol2.y = placeholder.yPos * symbols.height;
}

//This Function Will Check for any Mathces
async function checkForMatch() {
	let matchCount = 0;
  
  //Check Vertical
	for(let row = 0; row < gridSize - 2; row++) {
  	for(let column = 0; column < gridSize; column++) {
  		if ( logic.grid[row][column] != 0 && 
      logic.grid[row][column] == logic.grid[row+1][column] &&
      logic.grid[row][column] == logic.grid[row+2][column]) {
      		logic.score += 30;
      		matchCount++;
      		await removeSymbolFromPos(row, column);
          await removeSymbolFromPos(row + 1, column);
          await removeSymbolFromPos(row + 2, column);
      }
  	}
  }
  
  //Check Horizontal
  for(let row = 0; row < gridSize; row++) {
  	for(let column = 0; column < gridSize - 2; column++) {
  		if ( logic.grid[row][column] != 0 && 
      logic.grid[row][column] == logic.grid[row][column+1] &&
      logic.grid[row][column] == logic.grid[row][column+2]) {
      		logic.score += 30;
      		matchCount++;
      		await removeSymbolFromPos(row, column);
          await removeSymbolFromPos(row, column + 1);
          await removeSymbolFromPos(row, column + 2);
      }
  	}
  }
  if(matchCount > 0) {
  	return true;
  }
  return false;
}

//This Adds new Symbols When There is Blank Space
function dropTheSymbols() {
	for(const pos of logic.grid) {
  	if (pos[0] == 0) {
    	makeSymbol(randomNumber(6) + 1, logic.grid.indexOf(pos), 0);
    }
  }
}

//This Function Drags a Symbol if it's Clicked on
function mouseDown(e) {
	logic.mouseX = parseInt(e.clientX);
  logic.mouseY = parseInt(e.clientY);
  
  for (const symbol of symbols.symbolArray) {
  	getPosition(symbol);
  	if(ctx.isPointInPath(logic.mouseX,logic.mouseY)) {
    	symbol.x = logic.mouseX - symbols.width / 2;
    	symbol.y = logic.mouseY - symbols.height / 2;
    	symbol.selected = true;
    }
  }
}

//This Function Drags a Symbol if it's Clicked on
function mouseMove(e) {
	for (const symbol of symbols.symbolArray) {
  	if(symbol.selected) {
    	getPosition(symbol);
  		if(ctx.isPointInPath(logic.mouseX,logic.mouseY)) {
    		symbol.x = parseInt(e.clientX) - symbols.width / 2;
    		symbol.y = parseInt(e.clientY) - symbols.height / 2;
    	}
    }
  }
  
  logic.mouseX = parseInt(e.clientX);
  logic.mouseY = parseInt(e.clientY);
}

//This Function Releases a Symbol When Done Dragging
async function mouseUp(e) {
	logic.mouseX = parseInt(e.clientX);
  logic.mouseY = parseInt(e.clientY);
	for (const symbol of symbols.symbolArray) {
  	let newX, newY;
  	if(symbol.selected) {
    	symbol.selected = false;
    	newX = Math.round(symbol.x / symbols.width);
      newY = Math.round(symbol.y / symbols.height);
      
    	if (Math.abs(newX - symbol.xPos) <= 1 && 
      Math.abs(newY - symbol.yPos) <= 1 &&
      Math.abs(newX - symbol.xPos) != Math.abs(newY - symbol.yPos)) {
          const swapSymbol = getSymbolFromPos(newX, newY);
        	await swapSymbols(symbol, swapSymbol);
          
					checkForMatch().then(async (foundMatch) => {
          	if(!foundMatch) {
        			await swapSymbols(swapSymbol, symbol);
          	}
        	});      
      } else {
      	symbol.x = symbol.xPos * symbols.width;
        symbol.y = symbol.yPos * symbols.height;
      }
    }
  }
}

//This Function Generates a Random Number
function randomNumber(max) {
	return Math.floor(Math.random() * max);
}
