import {checkUsernameExistence} from "./misc.js";


export function validateNewGameForm(form, e) {
  if (e && e.target.getAttribute('name')) {
    form.querySelector('#playing_as').value = e.target.getAttribute('name');
  }
  const errors = form.querySelectorAll('.form-error.d-block');
  errors.length === 0 && form.submit();
}

export async function validateUser() {
  const username = document.querySelector('#id_opponent').value;
  const exists = await checkUsernameExistence(username);
  const errorContainer = document.querySelector('#user-error');
  if (exists) {
    errorContainer.classList.replace('d-block', 'd-none');
  } else {
    errorContainer.classList.replace('d-none', 'd-block');
    const currentUser = JSON.parse(document.querySelector('#user').textContent);
    errorContainer.textContent = currentUser === username ? 'Your opponent must be other than you.' : 'User does not exist.';
  }
}

export function editStartingFen() {
  const input_fen = document.querySelector('#id_starting_fen');
  const form = document.querySelector('#edit_starting_fen');
  form.appendChild(input_fen);
  form.submit();
}

export function changeTimeMode() {
  const time_mode = document.querySelector('#id_time_mode').value;
  const time_range = document.querySelector('#id_time_range');
  const time_display = document.querySelector('#time_value');
  if (time_mode === 'real') {
    time_range.disabled = false;
    time_display.value = time_range.value;
  } else {
    time_range.disabled = true;
    time_display.value = '∞';
  }
}

export function changeOponent() {
  const share_link = document.querySelector('#id_share_link').checked;
  console.log(share_link)
  document.querySelector('#id_opponent').disabled = share_link;
  share_link ?
    document.querySelector('#user-error').classList.replace('d-block', 'd-none') :
    document.querySelector('#user-error').classList.replace('d-none', 'd-block');
}


export function translateTimeInput(timeIndex) {
  function getTime() {
    const times = {
      30: 60,
      31: 75,
      32: 90,
      33: 105,
      34: 120,
      35: 135,
      36: 150,
      37: 165,
    }
    if (timeIndex <= 4) return timeIndex * 0.25;
    if (timeIndex === 5) return 1.5;
    if (timeIndex >= 6 && timeIndex <= 24) return timeIndex - 4;
    if (timeIndex <= 29) return 25 + (timeIndex - 25) * 5;
    if (timeIndex >= 30 && timeIndex <= 37) return times[timeIndex];
    return 180;
  }

  const time = getTime();
  document.querySelector('#time_value').value = time;
  document.querySelector('#id_time').value = time;
}


export function setStockfishLevel(level) {
  console.log(level);
  document.querySelector('#stockfish-level').value = level;
}

export function setStockfishThinkingTime(time) {
  console.log(time);
}
