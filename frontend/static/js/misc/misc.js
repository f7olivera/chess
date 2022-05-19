import Chess from "chess.js";

// PRE { chess.history().length > 0 }
export function getLastMove(chess) {
  const move_verbose = chess.history({verbose: true})[chess.history().length - 1]
  return move_verbose['from'] + move_verbose['to'];
}

export function parseHistory(chess) {
  const unicodePieces = {
    kw: '♔', qw: '♕', rw: '♖', bw: '♗', nw: '♘',
    kb: '♚', qb: '♛', rb: '♜', bb: '♝', nb: '♞'
  };
  const moves = chess.history({verbose: true});
  const movesPaired = moves.reduce((result, move, index, array) => {
    if (index === 0 && move.color === 'b') {
      result.push([].concat(array.slice(index, index + 2)));
    } else if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []);

  const chessCopy = new Chess(chess.fen());
  chessCopy.load_pgn(chess.pgn());
  chessCopy.history().forEach(() => chessCopy.undo())

  return movesPaired.map((pair, i) => {
    return {
      turnNumber: i + 1,
      moves: pair.map((move, j) => {
        chessCopy.move(chess.history()[2 * i + j]);
        const fen = chessCopy.fen();
        const pgn = chessCopy.pgn();
        return {
          fen: fen,
          pgn: pgn,
          // move: move.san && move.san.split('').map((char) =>
          //   /[A-NP-Z]/.test(char) ? unicodePieces[char.toLowerCase() + move.color] : char).join('')
          move: move.san && move.san
        }
      })
    }
  })
}

export function sendWebsocketMessage(ws, message) {
  if (!ws || ws.readyState !== ws.OPEN) return;

  ws.send(JSON.stringify({
    [message.name]: message.payload,
  }));
}

export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function bookmarkGame() {
  await fetch(`/bookmark/${window.location.href.split('/')[window.location.href.split('/').length - 2]}`, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'x-www-form-urlencoded',
      'X-CSRFToken': getCookie("csrftoken")
    })
  });
}

export function verbose2uci(moveVerbose) {
  return moveVerbose['from'] + moveVerbose['to'] + (moveVerbose['promotion'] ? moveVerbose['promotion'].toLowerCase() : '')
}

export function isUCI(str) {
  const cols = 'abcdefgh'
  return str.length === 4 &&
    cols.includes(str[0]) &&
    0 < str[1] && str[1] < 9 &&
    cols.includes(str[2]) &&
    0 < str[3] && str[3] < 9;
}

export function getPieceName(element) {
  return Array.from(element.classList).find((className) => className.length === 2)[0];
}

export function getCoord(element) {
  const square = Array.from(element.classList).filter((className) => className.startsWith('coord'))[0];
  return square && square.split('-')[1];
}

export function getMove(element, target) {
  const toSquare = target.className.startsWith("piece") ? target.parentElement : target;
  const pickedPiece = Array.from(element.classList).filter((className) => className !== 'piece')[0];
  const from = toSquare.classList.contains('generator') || getCoord(element.parentElement);
  const to = toSquare.classList.contains('generator') || getCoord(toSquare);
  return {pickedPiece, from, to, promotion: 'q'};
}

export function selectPiece(chess, playingAs, element, onDrop) {
  const square = element.parentElement;
  square.classList.add('selected');
  document.querySelector('.board').onmousedown = (event) => {
    square.classList.remove('selected');
    onDrop(getMove(element, event.target));
  }
  if (playingAs) {
    const moves = chess.moves({square: getCoord(element.parentElement), verbose: true});
    moves.forEach((move) => {
      const toSquare = document.querySelector('.game').querySelector(`.coord-${move.to}`);
      toSquare.classList.add('possible-move');
      if (move.flags === 'c') {
        toSquare.classList.add('capture');
      }
    });
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: unable to copy', err);
  }
  document.body.removeChild(textArea);
}

export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
  }, (err) => console.error('Async: Could not copy text: ', err));
}

export function checkUserExistence(username) {
  // {#const checkForUserForm = document.createElement('form');#}
  // {#checkForUserForm.method = 'POST';#}
  // {#const userInput = document.createElement('input');#}
  // {#userInput.value = user;#}
  // {#userInput.name = 'username';#}
  // {#checkForUserForm.appendChild(userInput)#}
  const request = new Request(window.location.origin + '/backend/user', {
    method: 'POST',
    body: JSON.stringify({username: username}),
    headers: new Headers({
      'Content-Type': 'x-www-form-urlencoded',
      'X-CSRFToken': getCookie("csrftoken")
    })
  });
  return fetch(request)
    .then((response) => response.json())
    .then((user) => {
      return user['exists'];
    });
}

export function whitenChild(e) {
  const buttonContainer = e.target.tagName === 'IMG' ? e.target.parentElement : e.target;
  const button = e.target.tagName === 'IMG' ? e.target : e.target.firstChild;
  if (!buttonContainer.classList.contains('disabled')) {
    button.style.filter = 'brightness(0) invert(1)';
  }
}

export function unwhitenChild(e) {
  const buttonContainer = e.target.tagName === 'IMG' ? e.target.parentElement : e.target;
  const button = e.target.tagName === 'IMG' ? e.target : e.target.firstChild;
  if (!buttonContainer.classList.contains('disabled')) {
    button.style.filter = 'invert(82%) sepia(1%) saturate(19%) hue-rotate(314deg) brightness(93%) contrast(88%)';
  }
}