import React, {useMemo, useState} from 'react';

function classNames(props) {
    var result = '';
    Object.keys(props).forEach((key) => {
        if(props[key]){
            result += key;
            result += ' ';
        }
    })
    return result;
}

function Suduko() {
    const size = 3;
    const neigborsMap = useMemo(() => getNeighborsMap(getIndicies(size)), [size]);
    const [gameBoard, setGameBoard] = useState(() => getInitialGameBoard(size));

    const handleInput = (square) => (evt) => {
        let input = validateInput(evt);
        if(input){
            let number = input !== "*" ? input : 0;
            let nextGameBoard = [...gameBoard];
            if (number === 0 || validMove(nextGameBoard, square, number, neigborsMap)) {
                nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, square)
            } else {
                nextGameBoard = failingSquareOnGameBoard(nextGameBoard, square)
            }
            setGameBoard(placeNumberOnGameBoard(number, nextGameBoard, square));
        }
    }
    let boardUI = gameBoard.map(row => {
        let cols = row.values.map(square => {
            let tdClassnames = classNames({
                "verticalBorder": square.x === 2 || square.x === 5,
                "horizontalBorder" : square.y === 2 || square.y === 5,
                "failed" : square.failing
            });
            return (
                <td key={square.id} className={tdClassnames}>
                    <input key={square.id} type={"text"} onPaste={handleInput(square)} onKeyDown={handleInput(square)} defaultValue={square.value === 0 ? '' : square.value} size={1} maxLength={1}/>
                </td>
            )
        });
        return (
            <tr key={row.id}>
                {cols}
            </tr>
        )
    })
    return (
        <>
            <h1>Welcome to Suduko</h1>
            <table className={"App gameBoard"}>
                <tbody>{boardUI}</tbody>
            </table>
        </>
    );
}
const validateInput = (evt) => {
    var theEvent = evt || window.event;
    var keyCode = theEvent.keyCode || theEvent.which;
    let key = String.fromCharCode(keyCode);

    var regex = /[1-9]/;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (/[ -~]/.test(key) && theEvent.preventDefault) {
            theEvent.preventDefault();
        }
        if (keyCode === 8 || keyCode === 32) {
            return "*";
        }
        return;
    } else {
        return key;
    }
}

function getKey(square) {
    return square.x + ":" + square.y;
}

const validMove = (gameBoard, square, number, neigborsMap) => {
    return neigborsMap[getKey(square)].every((neigbors) => {
        return !someNeighborHaveNumber(number, gameBoard, neigbors);
    })
}

const someNeighborHaveNumber = (number, gameBoard, neighbors) => {
    return neighbors.some((neighbor) => number === getNumberOnGameBoard(gameBoard, neighbor))


}
function failingSquareOnGameBoard(gameBoard, square) {
    gameBoard[square.y].values[square.x].failing = true;
    return gameBoard;
}
function clearFailingSquareOnGameBoard(gameBoard, square) {
    gameBoard[square.y].values[square.x].failing = false;
    return gameBoard;
}
function placeNumberOnGameBoard(number, gameBoard, square) {
    gameBoard[square.y].values[square.x].value = number;
    return gameBoard;
}
function getNumberOnGameBoard(gameBoard, square) {
    return gameBoard[square.y].values[square.x].value;
}

function buildSquare(y, x, value) {
    return {id: y + ":" + x, y: y, x: x, value: value, failing: false};
}

function getInitialGameBoard(size) {
    let height = size*size;
    let width = size*size;
    var result = [];
    for (var i = 0 ; i < height; i++) {
        result[i] = {id:i, values:[]};
        for (var j = 0; j < width; j++) {
            result[i].values[j] = buildSquare(i, j, 0);
        }
    }
    return result;
}
function getIndicies(size){
    let numberOfRows = size*size;
    let numberOfCols = size*size;
    let allInidicies = [];

    // Add all rows
    for(let row = 0; row < numberOfRows; row++){
        let rowIndicies = [];
        for(let col = 0; col < numberOfCols; col++){
            rowIndicies.push({"x": col, "y":row})
        }
        allInidicies.push(rowIndicies);
    }
    // Add all columns
    for(let col = 0; col < numberOfCols ; col++){
        let rowIndicies = [];
        for(let row = 0; row < numberOfRows; row++){
            rowIndicies.push({"x": col, "y":row})
        }
        allInidicies.push(rowIndicies);
    }

    /*
     *  0  1  |  4  5
     *  2  3  |  6  7
     * -------+-------
     *  8  9  | 12 13
     * 10 11  | 14 15
     *
     *  0 -> 0:0 1 -> 0:1   2 -> 1:0   3 -> 1:1
     *  4 -> 0:2 5 -> 0:3   6 -> 1:2   7 -> 1:3
     *  8 -> 2:0 9 -> 2:1  10 -> 3:0  11 -> 3:1
     * 12 -> 2:2 13 -> 2:3 14 -> 3:2  15 -> 3:3
     *
     */
    const quadrantSize = size;
    const numOfQuadrants = size;
    let quadrantRows = numOfQuadrants;
    let quadrantCols = numOfQuadrants;
    let rowsInQuadrant = quadrantSize;
    let colsInQuadrant = quadrantSize;

    for (let quadrantRow = 0; quadrantRow < quadrantRows; quadrantRow++) {
        for (let quadrantCol = 0; quadrantCol < quadrantCols; quadrantCol++) {
            let quadrantIndicies = [];
            for (let row = 0; row < rowsInQuadrant; row++) {
                for (let col = 0; col < colsInQuadrant; col++) {
                    let x = (quadrantCol*quadrantSize) + col;
                    let y = (quadrantRow*quadrantSize) + row;
                    quadrantIndicies.push({"x":x, "y":y});
                }
            }
            allInidicies.push(quadrantIndicies);
        }
    }

    return allInidicies;
}

function getNeighborsMap(indicies){
    let neighborsMap = {};
    for(let i = 0; i < indicies.length; i++){
        for(let j = 0; j < indicies[i].length; j++){
            let neighbor = indicies[i][j];
            let key = neighbor.x + ":" + neighbor.y;
            if (neighborsMap[key] === undefined) {
                neighborsMap[key] = []
            }
            neighborsMap[key].push(indicies[i])
        }
    }
    return neighborsMap;
}

export default Suduko;
