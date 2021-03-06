import React, {useMemo, useState, useEffect, useRef} from 'react';

function Suduko() {
    const size = 3;
    const [runTimer, setRunTimer] = useState(true);
    const indicies = useMemo(() => getIndicies(size), [size]);
    const neigborsMap = useMemo(() => getNeighborsMap(getIndicies(size)), [size]);
    const {setQueryParam, getQueryParam} = useHistory();

    const useHint = useMemo(() => {
        return getQueryParam('h') === "true"||false;
    }, [getQueryParam]);

    function setUseHint(newUseHintValue){
        setQueryParam('h', newUseHintValue);
    }

    const validQueryParameters = useMemo(() => {
        return /^[0-9]*$/.test(getQueryParam('b')|| '') && /^(true|false)?$/.test(getQueryParam('h')||'')
    }, [getQueryParam])
    const gameBoard = useMemo(() => {
        return withNumbersHint(withValidateNumbers(getInitialGameBoard(size, getGameBoardValues(getQueryParam('b'), size)), indicies), neigborsMap);
        }, [getQueryParam, indicies, neigborsMap]);

    const remainingNumbers = useMemo(() => {
        return getNumberOfEmptyPositionsInGameboard(gameBoard);
    }, [gameBoard])

    function setGameBoard(gb){
        var result = [];
        for (var i = 0 ; i < gb.length; i++) {
            for (var j = 0; j < gb[i].values.length; j++) {
                result.push(gb[i].values[j].value);
            }
        }
        setQueryParam('b', result.join(''))
    }

    const handleInput = (square) => (evt) => {
        let input = validateInput(evt);
        if (input) {
            let number = input !== "*" ? input : 0;
            let nextGameBoard = deepCopy(gameBoard);
            nextGameBoard = placeNumberOnGameBoard(number, nextGameBoard, square);
            setGameBoard(nextGameBoard);

        }
    }
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
                    <Square useHint={useHint} title={title} disabled={square.locked} key={square.id} handleInput={handleInput} square={square}/>
                </td>
            )
        });
        return (
            <tr key={row.id}>
                {cols}
            </tr>
        )
    })

    function toggleTimerActive(){
        setRunTimer(!runTimer);
    }

    function onUseHintChanged(e){
        setUseHint(e.target.checked);
    }
    function onAddSigletonValuesClicked(){
        addSingletonValues(gameBoard, setGameBoard, neigborsMap);
    }

    return (
        <>
            <h1>Welcome to Suduko</h1>
            {!validQueryParameters &&
                <p>Invalid request parameters, only 0-9 are allowed as numbers and 'true', or 'false', as boolean values</p>
            }
            {validQueryParameters &&
                <>
                    <Timer run={runTimer && remainingNumbers > 0}/>
                    <button style={{margin:"10px"}} onClick={toggleTimerActive} disabled={remainingNumbers === 0} >{runTimer?"Pause":"Continue"}</button>
                    <p>
                        {remainingNumbers > 0 && "Numbers to play: " + remainingNumbers}
                        {remainingNumbers > 0 && <span style={{marginLeft:"10px"}}>Use hints: <input type={"checkbox"} checked={useHint} onChange={onUseHintChanged}/></span>}
                        {remainingNumbers === 0 && "Congratulation, no more numbers to play!"}
                    </p>
                    <table className={"App gameBoard"}>
                        <tbody>{boardUI}</tbody>
                    </table>
                    {remainingNumbers > 0 && <button onClick={onAddSigletonValuesClicked}>Insert singleton values</button>}
                </>
            }
        </>
    );
}

function Square({useHint, title, disabled, key, square, handleInput}){
    const showHint = useHint && square.value === 0;
    const opacity = showHint ? 0.5 : 1.0;
    return (
        <div style={{display:"grid"}}>
            {showHint && <span style={{gridColumn:1, gridRow:1, fontSize:"10px"}}>{title}</span>}
            <input style={{gridColumn:1, gridRow:1, opacity:opacity}} title={title} disabled={disabled} key={key} type={"text"} onPaste={handleInput(square)} onKeyDown={handleInput(square)} defaultValue={square.value === 0 ? '' : square.value} size={1} maxLength={1}/>
          </div>
    )
}
function useHistory(){
        const [href, setHref] = useState(window.location.href);
        const params = useMemo(() => {
            let searchParams = new URLSearchParams(window.location.search);
            let params = {};
            for(var key of searchParams.keys()){
                params[key] = searchParams.get(key);
            }
            return params;
        }, [window.location.search]);

        useEffect(() => {
            window.addEventListener('popstate', () => {
                setHref(window.location.href)
            });
        }, [])

        function pushState(_href){
            window.history.pushState({}, '', _href)
            window.dispatchEvent(new Event('popstate'));
        }
        function setQueryParam(param, value){
            let searchParams = new URLSearchParams(window.location.search);
            searchParams.set(param, value);
            pushState(window.location.href.split("?")[0] + "?" + searchParams)
        }
        function getQueryParam(param){
            let searchParams = new URLSearchParams(window.location.search);
            return searchParams.get(param);
        }

        return {href, params, pushState, setQueryParam, getQueryParam};

}

function Timer({run}){
        const {getElapsedTime, time0} = useTimer();
        const [time, setTime] = useState(time0);

        useInterval(() => {
            setTime(getElapsedTime());
        }, run ? 1000 : null)

        return (
            <>
            {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
            </>
        )
}

function useTimer(){
    const initialTime = useMemo(() => {
        return new Date().getTime();
    },[])

    function getElapsedTime(){
        let now = new Date().getTime();
        let distance = now - initialTime;
        return toTime(distance);
    }
    function time0(){
        return toTime(0)
    }

    function toTime(distance){
        return {
            days: distance ? Math.floor(distance / (1000 * 60 * 60 * 24)) : 0,
            hours: distance ? Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : 0,
            minutes: distance ? Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) : 0,
            seconds: distance ? Math.floor((distance % (1000 * 60)) / 1000) : 0
        }
    }
    return{
        getElapsedTime,
        time0,
    }
}

function useInterval(callback, delay){
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function getGameBoardValues(valuesAsString, size){
        let height = size*size;
        let width = size*size;
        let values = (valuesAsString?valuesAsString.split(''):[]).concat(new Array(height * width));
        var result = [];
        for (var i = 0 ; i < height; i++) {
            result[i] = [];
            for (var j = 0; j < width; j++) {
                result[i][j] = parseInt(values[i*height+j]||'0', 10);
            }
        }
        return result;

}

function withValidateNumbers(gameBoard, indicies){
    let newGameBoard = [...gameBoard];
    indicies.forEach(is => {
        let numbers = {};
        is.forEach(i => {
            let n = getNumberOnGameboard(gameBoard, i);
            if(n !== 0){
                if(numbers[n]){
                    numbers[n].push(i)
                } else {
                    numbers[n] = [i]
                }
            }
        })
        if(Object.keys(numbers).length > 1)
            Object.keys(numbers).forEach(key => {
                if(numbers[key].length > 1){
                    numbers[key].forEach(pos =>{
                        newGameBoard = failingSquareOnGameBoard(newGameBoard, pos);
                    })
                }
            })

    })
    return newGameBoard;
}
function withNumbersHint(gameBoard, neigborsMap){
    let newGameBoard = [...gameBoard];
    Object.keys(neigborsMap)
    .map(key => getPosFromKey(key))
    .forEach(pos => {
        let currentValue = getNumberOnGameboard(newGameBoard, pos);
        if(currentValue === 0){
            newGameBoard = mapHint(newGameBoard, pos, (n, oldValue) => {
                return isEmptyArray(getAllNeighborsWithNumber(neigborsMap, pos, n, gameBoard));
            });
        } else {
            newGameBoard = mapHint(newGameBoard, pos, (n, oldValue)=> {
                return n === 0 ;
            });
        }
    })
    return newGameBoard;
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

function getNeighbors(neigborsMap, pos){
    return [...neigborsMap[getKeyFromPos(pos)]];
}

function getAllNeighborsWithNumber(neigborsMap, pos, number, gameboard) {
    return getNeighbors(neigborsMap,pos).filter((neighbor) => {
        return !isSamePos(pos, neighbor) && number === getNumberOnGameboard(gameboard, neighbor);
    });
}

function failingSquareOnGameBoard(gameBoard, pos) {
    return mapGameboardSquare(gameBoard, pos, (square) => {square.failing = true;})
}
function placeNumberOnGameBoard(number, gameBoard, pos) {
    return mapGameboardSquare(gameBoard, pos, (square) => {square.value = number;})
}
function getNumberOnGameboard(gameBoard, pos) {
    return gameBoard[pos.y].values[pos.x].value;
}
function getNumberOfEmptyPositionsInGameboard(gameBoard) {
    let height = gameBoard.length;
    let width = gameBoard.length;
    var result = width*height;
    for (var i = 0 ; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if(gameBoard[i].values[j].value > 0){
                result -= 1
            }
        }
    }
    return result;
}

function addSingletonValues(gameBoard, setGameBoard, neigborsMap) {
    function getHintValues(hints){
        let values = [];
        Object.keys(hints).forEach((key) => {
            if(hints[key]){
                values.push(key);
            }
        });
        return values;
    }
    let height = gameBoard.length;
    let width = gameBoard.length;
    let newGameBoard = deepCopy(gameBoard);
    var counter = 0;
    do{
        var valueAdded=false;
        for (var y = 0 ; y < height; y++) {
            for (var x = 0; x < width; x++) {
                if(newGameBoard[y].values[x].value === 0){
                    let hintValues = getHintValues(newGameBoard[y].values[x].possible);
                    if(hintValues.length === 1){
                        newGameBoard = withNumbersHint(placeNumberOnGameBoard(Number(hintValues[0]), newGameBoard, buildPos(y,x)), neigborsMap);
                        valueAdded=true
                        counter++;
                    }
                }
            }
        }
    } while(valueAdded);
    setGameBoard(newGameBoard);
}

function getInitialGameBoard(size, values) {
    let height = size*size;
    let width = size*size;
    var result = [];
    for (var i = 0 ; i < height; i++) {
        result[i] = {id:i, values:[]};
        for (var j = 0; j < width; j++) {
            result[i].values[j] = buildSquare(i, j, values[i][j]);
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
function mapHint(gameBoard, poss, fn){
    return mapGameboardSquare(gameBoard, poss, (square)=>{
        Object.keys(square.possible).forEach(numStr => {
            square.possible[numStr] = fn(Number(numStr),square.possible[numStr]);
        })
        return square;
    })
}

function buildPos(y,x){return {y:y, x:x}};
function isSamePos(s1, s2){return s1.x === s2.x && s1.y === s2.y;}
function getKeyFromPos(pos){return pos.x + ":" + pos.y;}
function getPosFromKey(key){return {x:key.split(":")[0], y:key.split(":")[1]};}

const isEmptyArray = (array) => {return !array || !array.length;}
function deepCopy(gameBoard) {return JSON.parse(JSON.stringify(gameBoard));}


export default Suduko;
