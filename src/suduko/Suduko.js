import React, {useMemo, useState} from 'react';

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
            let prevNumber = getNumberOnGameboard(gameBoard, square);
            if (number === 0) {
                // This square has been reset, clear any failure flags
                nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, square)
                // Re-evaluate neighbors that have same number (in case a faulty state has been resolved)
                let gb = placeNumberOnGameBoard(number, nextGameBoard, square);
                let neighborsWithNumber = getAllNeighborsWithNumber(neigborsMap, square, prevNumber, gb)
                neighborsWithNumber.forEach((neighbor) => {
                    if (validMove(gb, neighbor, prevNumber, neigborsMap)) {
                        nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, neighbor)
                    } else {
                        nextGameBoard = failingSquareOnGameBoard(nextGameBoard, neighbor)
                    }
                })
            } else if (isValidNumber(square, number)) {
                nextGameBoard = clearFailingSquareOnGameBoard(nextGameBoard, square);
            } else {
                nextGameBoard = failingSquareOnGameBoard(nextGameBoard, square);
            }
            nextGameBoard = placeNumberOnGameBoard(number, nextGameBoard, square);
            nextGameBoard = updatePossibleNumbers(square, neigborsMap, nextGameBoard, number, prevNumber);

            setGameBoard(nextGameBoard);

        }
    }
    function saveGameboard(){
        let nextSavedGameboards = deepCopy(savedGameboards);
        nextSavedGameboards.push(deepCopy(gameBoard));
        setSavedGameboards(nextSavedGameboards);
        let nextGameboard = deepCopy(gameBoard);
        setGameBoard(lockGameboard(nextGameboard));

    };
    function restoreGameboard(){
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
            let possibleNumbers = [];
            for (let [key, value] of Object.entries(square.possible)) {
                if (key !== "0" && value) {
                    possibleNumbers.push(key);
                }
            }
            let title = possibleNumbers.join(", ");

            return (
                <td key={square.id} className={tdClassnames}>
                    <input title={title} disabled={square.locked} key={square.id} type={"text"} onPaste={handleInput(square)} onKeyDown={handleInput(square)} defaultValue={square.value === 0 ? '' : square.value} size={1} maxLength={1}/>
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

function validateInput(evt){
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

function lockGameboard(gameboard) {
    return mapEachSquare(gameboard, (square) => {
        square.locked = square.value > 0;
        return square;
    });
}

function getNeighbors(neigborsMap, pos){
    return [...neigborsMap[getKeyFromPos(pos)]];
}

function getAllNeighborsWithNumber(neigborsMap, pos, number, gameboard) {
    return getNeighbors(neigborsMap,pos).filter((neighbor) => {
        return !isSamePos(pos, neighbor) && number === getNumberOnGameboard(gameboard, neighbor);
    });
}

function updatePossibleNumbers(currentPos, neigborsMap, gameboard, number, prevNumber) {
    let poss = [currentPos,...getNeighbors(neigborsMap, currentPos)];
    let mapGameboardSquare1 = mapGameboardSquare(gameboard, poss, (s) => {
        s.possible[number] = !isSamePos(currentPos, s) && validMove(gameboard, s, number, neigborsMap);
        s.possible[prevNumber] = validMove(gameboard, s, prevNumber, neigborsMap);
    });
    return mapGameboardSquare1;
}
function validMove(gameBoard, pos, number, neigborsMap){
    let newVar = number === 0 || isEmptyArray(getAllNeighborsWithNumber(neigborsMap, pos, number, gameBoard));
    return newVar;
}

function failingSquareOnGameBoard(gameBoard, pos) {
    return mapGameboardSquare(gameBoard, pos, (square) => {square.failing = true;})
}
function clearFailingSquareOnGameBoard(gameBoard, pos) {
    return mapGameboardSquare(gameBoard, pos, (square) => {square.failing = false;})
}
function placeNumberOnGameBoard(number, gameBoard, pos) {
    return mapGameboardSquare(gameBoard, pos, (square) => {square.value = number;})
}
function getNumberOnGameboard(gameBoard, pos) {
    return gameBoard[pos.y].values[pos.x].value;
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

function mapGameboardSquare(gameboard, poss, fn){
    let gb = deepCopy(gameboard);
    let ps = Array.isArray(poss) ? poss : [poss];
    ps.forEach((pos) => {
        let result = fn(gb[pos.y].values[pos.x]);
        if( typeof result !== 'undefined'){
            gb[pos.y].values[pos.x] = result;
        }

    })
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

function buildSquare(y, x, value){
    let square = {
        id: y + ":" + x,
        y: y,
        x: x,
        value: value,
        failing: false,
        locked: false,
        possible: {"0": true, "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true, "9": true}
    };
    square.possible[value] = false;
    return square;
}
function isValidNumber(square, number) {return square.possible[number];}

function buildPos(y,x){return {y:y, x:x}};
function isSamePos(s1, s2){return s1.x === s2.x && s1.y === s2.y;}
function getKeyFromPos(pos){return pos.x + ":" + pos.y;}

const isEmptyArray = (array) => {return !array || !array.length;}
function deepCopy(gameBoard) {return JSON.parse(JSON.stringify(gameBoard));}


export default Suduko;
