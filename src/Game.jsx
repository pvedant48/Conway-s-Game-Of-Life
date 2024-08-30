import React from 'react'
import './Game.css'

const cellSize = 20;
const width = 800;
const height = 600;

class Cell extends React.Component {
    render() {
        const { x, y } = this.props;
        return (
            <div className="Cell" style={{
                left: `${cellSize * x + 1}px`,
                top: `${cellSize * y + 1}px`,
                height: `${cellSize - 1}px`,
                width: `${cellSize - 1}px`
            }
            } />
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.rows = height / cellSize;
        this.cols = width / cellSize;
        this.board = this.makeEmptyBoard();
    }
    state = { cells: [], isRunning: false, interval: 100 }

    runGame = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    stopGame = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        console.log('Running Iteration')
        let newBoard = this.makeEmptyBoard();

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbours = this.calculateNeighbours(this.board, x, y);
                if (this.board[y][x]) {
                    if (neighbours === 2 || neighbours === 3) {
                        newBoard[y][x] = true;
                    }
                    else {
                        newBoard[y][x] = false;
                    }
                }
                else {
                    if (!this.board[y][x] && neighbours === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells() });
        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    handleIntervalChange = (event) => {
        this.setState({ interval: event.target.value });
    }

    calculateNeighbours(board, x, y) {
        let neighbours = 0;
        let directions = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];
            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbours++;
            }
        }
        return neighbours;
    }


    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }
        return board;
    }

    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }
        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;
        return {
            x: (rect.left + window.scrollX) - doc.clientLeft,
            y: (rect.top + window.scrollY) - doc.clientTop
        };
    }

    handleClick = (e) => {
        const offsets = this.getElementOffset();
        const offsetX = e.clientX - offsets.x;
        const offsetY = e.clientY - offsets.y;

        const x = Math.floor(offsetX / cellSize);
        const y = Math.floor(offsetY / cellSize);

        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.board[y][x] = !this.board[y][x];
        }
        this.setState({ cells: this.makeCells() });
    }

    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }

        this.setState({ cells: this.makeCells() });
    }

    handleClear = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = false;
            }
        }
        this.setState({ cells: this.makeCells() });
    }


    render() {
        const { cells, interval, isRunning } = this.state;


        return (
            <div>
                <div onClick={this.handleClick} ref={(n) => { this.boardRef = n; }} className="board" style={{ width, height, backgroundSize: `${cellSize}px ${cellSize}px` }}>
                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
                    ))}
                </div>
                <div className="controls">
                    Update every<input value={this.state.interval} onChange={this.handleIntervalChange} />milisec
                    {isRunning ?
                        <button className='button' onClick={this.stopGame}>Stop</button> :
                        <button className='button' onClick={this.runGame}>Run</button>}
                    <button className="button" onClick={this.handleRandom}>Random</button>
                    <button className="button" onClick={this.handleClear}>Clear</button>
                </div>
            </div>
        )
    }
}

export default Game