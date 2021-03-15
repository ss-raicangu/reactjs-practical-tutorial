import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className={props.winningSquare ? "winning-square square" : "square"}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winning_square =
          this.props.winningRow && this.props.winningRow.includes(i);
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        winningSquare={winning_square}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const indices = [ 0, 1, 2 ]
    return (
      <div>
        {indices.map(row => (
          <div key={'row'+row} className="board-row">
            {indices.map(col => this.renderSquare(row * 3 + col))}
          </div>
        ))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      position: [{
        coordinates: Array(2).fill(null),
      }],
      xIsNext: true,
      moveListIsReversed: false,
    };
  }

  getLastElement(array) {
    return array[array.length - 1];
  }

  handleClick(i) {
    const position = this.state.position.slice(0, this.state.stepNumber + 1);
    const history  = this.state.history.slice(0, this.state.stepNumber + 1);
    const coordinates = this.getLastElement(position).coordinates.slice();
    const squares     = this.getLastElement(history).squares.slice();

    // `coordinates': 0=column, 1=row. Didn't use JSON because there is no easy
    // method to create a deep-clone.
    coordinates[0] = i % 3 + 1;
    coordinates[1] = Math.floor(i / 3) + 1;
    if (calculateWinner(squares)[0] || squares[i]) {
      console.log(squares);
      return;
    }
    // Must be after the if-condition.
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      position: position.concat([{
        coordinates: coordinates,
      }]),
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  generateMoveList() {
    let history = this.state.history.slice();
    if (this.state.moveListIsReversed) {
      history.reverse();
    }
    return history.map((step, move) => {
      const actual_move = this.state.moveListIsReversed ?
            (history.length - 1) - move :
            move;
      const coordinates =
            ' (' + this.state.position[actual_move].coordinates.join() + ')';
      let desc = actual_move ?
          'Go to move #' + actual_move + coordinates :
          'Go to game start (col, row)';
      return (
        <li key={move}>
          <button
            className={actual_move === this.state.stepNumber ?
                       'selected-move' : ''}
            onClick={() => this.jumpTo(actual_move)}
          >
            {desc}
          </button>
        </li>
      );
    });
  }

  render() {
    const current = this.state.history[this.state.stepNumber];
    const [winner, winning_row] = calculateWinner(current.squares);
    const draw = !current.squares.includes(null);
    const status = winner ?
          ('Winner: ' + winner) :
          (draw ?
           'Draw' :
           ('Next player: ' + (this.state.xIsNext ? 'X' : 'O')));
    let moves = this.generateMoveList();

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningRow={winning_row}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
            onClick={() => this.setState(
              { moveListIsReversed: !this.state.moveListIsReversed })}
          >
            Toggle Order
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [ squares[a], lines[i] ];
    }
  }
  return [ null, null ];
}
