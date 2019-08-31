import React, {useState} from 'react';

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
    const [gameBoard, setGameBoard] = useState(getInitialGameBoard);

    const handleInput = (square) => (evt) => {
        console.log("handleInput", gameBoard)
        let number = validateInput(evt);
        if(number){
            let nextGameBoard = placeNumberOnGameBoard(number, gameBoard, square);
            setGameBoard(nextGameBoard);
        }
    }
    let boardUI = gameBoard.map(row => {
        let cols = row.values.map(square => {
            let tdClassnames = classNames({
                "verticalBorder": square.x === 2 || square.x === 5,
                "horizontalBorder" : square.y === 2 || square.y === 5
            });
            return (
                <td key={square.id} className={tdClassnames}>
                    <input type={"text"} onPaste={handleInput(square)} onKeyPress={handleInput(square)} defaultValue={square.value === 0 ? '' : square.value} size={1} maxLength={1}/>
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
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);

    var regex = /[1-9]/;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) {
        }
        theEvent.preventDefault();
        return
    } else {
        return key;
    }
}
function placeNumberOnGameBoard(number, gameBoard, pos) {
    console.log("placeNumberOnGameBoard", number, pos, gameBoard)
    gameBoard[pos.y].values[pos.x].value = number;
    return gameBoard;
}
function getInitialGameBoard() {
    let height = 9;
    let width = 9;
    var result = [];
    for (var i = 0 ; i < height; i++) {
        result[i] = {id:i, values:[]};
        for (var j = 0; j < width; j++) {
            result[i].values[j] = {id:i+":"+j,y:i,x:j, value:0};
        }
    }
    return result;
}

export default Suduko;
