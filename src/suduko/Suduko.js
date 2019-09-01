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

function deepCopy(gameBoard) {
    return JSON.parse(JSON.stringify(gameBoard));
}

function lockGameboard(gameboard) {
    return mapEachSquare(gameboard, (square) => {
        square.locked = square.value > 0;
        return square;
    });
}

function Suduko() {
    const size = 3;
    const neigborsMap = useMemo(() => getNeighborsMap(getIndicies(size)), [size]);
    const [gameBoard, setGameBoard] = useState(() => getInitialGameBoard(size, neigborsMap));
    const [savedGameboards, setSavedGameboards] = useState([]);

    const handleInput = (square) => (evt) => {
        let input = validateInput(evt);
        if (input) {
            let number = input !== "*" ? input : 0;
            let nextGameBoard = deepCopy(gameBoard);
            if (number === 0) {
                // This square has been reset, clear any failure flags
                nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, square)
                // Re-evaluate neighbors that have same number (in case a faulty state has been resolved)
                let prevNumber = getNumberOnGameboard(gameBoard, square);
                let gb = placeNumberOnGameBoard(number, nextGameBoard, square);
                let neighborsWithNumber = getAllNeighborsWithNumber(neigborsMap, square, prevNumber, gb)
                neighborsWithNumber.forEach((neighbor) => {
                    if (validMove(gb, neighbor, prevNumber, neigborsMap)) {
                        nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, neighbor)
                    } else {
                        nextGameBoard = failingSquareOnGameBoard(nextGameBoard, neighbor)
                    }
                })
            } else if (validMove(gameBoard, square, number, neigborsMap)) {
                nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, square)
            } else {
                nextGameBoard = failingSquareOnGameBoard(nextGameBoard, square)
            }
            setGameBoard(placeNumberOnGameBoard(number, nextGameBoard, square));
        }
    }
    const saveGameboard = () => {
        let nextSavedGameboards = deepCopy(savedGameboards);
        nextSavedGameboards.push(deepCopy(gameBoard));
        setSavedGameboards(nextSavedGameboards);
        let nextGameboard = deepCopy(gameBoard);
        setGameBoard(lockGameboard(nextGameboard));

    };
    const restoreGameboard = () => {
        let nextSavedGameboards = deepCopy(savedGameboards);
        setGameBoard(nextSavedGameboards.pop());
        setSavedGameboards(nextSavedGameboards);
    };
    let boardUI = gameBoard.map(row => {
        let cols = row.values.map(square => {
            let tdClassnames = classNames({
                "verticalBorder": square.x === 2 || square.x === 5,
                "horizontalBorder" : square.y === 2 || square.y === 5,
                "failed" : square.failing
            });
            return (
                <td key={square.id} className={tdClassnames}>
                    <input disabled={square.locked} key={square.id} type={"text"} onPaste={handleInput(square)} onKeyDown={handleInput(square)} defaultValue={square.value === 0 ? '' : square.value} size={1} maxLength={1}/>
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
            <button onClick={saveGameboard}>Save</button>
            <button onClick={restoreGameboard} disabled={isEmptyArray(savedGameboards)}>Restore ({savedGameboards.length})</button>
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

function getAllNeighborsWithNumber(neigborsMap, square, number, gameboard) {
    return neigborsMap[getKeyFromPos(square)].filter((neighbor) => {
        return !isSamePos(square, neighbor) && number === getNumberOnGameboard(gameboard, neighbor);
    });
}

const validMove = (gameBoard, square, number, neigborsMap) => {
    return isEmptyArray(getAllNeighborsWithNumber(neigborsMap, square, number, gameBoard));
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
    gameBoard[square.y].values[square.x].possible[number] = false;
    return gameBoard;
}
function getNumberOnGameboard(gameBoard, square) {
    return gameBoard[square.y].values[square.x].value;
}

function getInitialGameBoard(size, neighborsMap) {
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
            rowIndicies.push(buildPos(row, col));
        }
        allInidicies.push(rowIndicies);
    }
    // Add all columns
    for(let col = 0; col < numberOfCols ; col++){
        let rowIndicies = [];
        for(let row = 0; row < numberOfRows; row++){
            rowIndicies.push(buildPos(row, col));
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
                    quadrantIndicies.push(buildPos(y, x));
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
            let key = getKeyFromPos(indicies[i][j]);
            if (neighborsMap[key] === undefined) {
                neighborsMap[key] = []
            }
            neighborsMap[key] = getUniquePoss([...neighborsMap[key], ...indicies[i]]);
        }
    }
    return neighborsMap;
}

function mapEachSquare(gameboard, fn){
    let gb = deepCopy(gameboard);
    for (let i = 0; i < gb.length; i++) {
        for (let j = 0; j < gb[i].values.length; j++) {
            gb[i].values[j] = fn(gb[i].values[j]);
        }
    }
    return gb;
}

function getUniquePoss(a) {
    if(a.length === 0){
        return [];
    }
    var b = [a[0]], i, j, tmp;
    for (i = 1; i < a.length; i++) {
        tmp = 1;
        for (j = 0; j < b.length; j++) {
            if (isSamePos(a[i], b[j])) {
                tmp = 0;
                break;
            }
        }
        if (tmp) {
            b.push(a[i]);
        }
    }
    return b;
}

const buildSquare = (y, x, value) => { return {id: y + ":" + x, y: y, x: x, value: value, failing: false, locked:false, possible:{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true,"8":true,"9":true}};}
const buildPos = (y,x) => {return {y:y, x:x}};
const isSamePos = (s1, s2) => {return s1.x === s2.x && s1.y === s2.y;}
const getKeyFromPos = (pos) => {return pos.x + ":" + pos.y;}
const isEmptyArray = (array) => {return !array || !array.length;}

export default Suduko;
