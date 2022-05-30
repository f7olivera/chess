import {checkUserExistence, getCookie} from "./misc.js";

const displayError = (errorContainer, message) => {
  errorContainer.textContent = message;
  errorContainer.classList.replace('d-none', 'd-block');
}

export function submitRegisterForm() {
  const registerForm = document.querySelector('.authentication[action="/register"]');
  const emptyFields = registerForm.querySelectorAll('input:not([type="hidden"])');
  emptyFields.forEach((field) => {
    if (field.value === '') {
      const errorContainer = field.parentElement.querySelector('.form-error');
      displayError(errorContainer, 'This field is necessary.');
    }
  });
  const errors = registerForm.querySelectorAll('.form-error.d-block');
  errors.length === 0 && registerForm.submit();
}

export function validateNewUser() {
  const registerForm = document.querySelector('.authentication[action="/register"]');
  const username = registerForm.querySelector('[name=username]').value;
  const errorContainer = registerForm.querySelector('#user-error');

  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    displayError(errorContainer, 'Username must only contain letters, numbers and underscores.');
  } else if (username && username.length < 3) {
    displayError(errorContainer, 'Username must contain at least 3 characters.');
  } else if (username && username.length > 20) {
    displayError(errorContainer, 'Username must be under 20 characters long.');
  } else {
    errorContainer.classList.replace('d-block', 'd-none');
  }
}

export async function checkUserExistance() {
  const registerForm = document.querySelector('.authentication[action="/register"]');
  const username = registerForm.querySelector('[name=username]').value;
  const errorContainer = registerForm.querySelector('#user-error');
  const exists = await checkUserExistence(username);

  if (exists) {
    displayError(errorContainer, 'Username already taken.');
  }
}

export async function validateEmail() {
  const registerForm = document.querySelector('.authentication[action="/register"]');
  const email = registerForm.querySelector('[name=email]').value;
  const errorContainer = registerForm.querySelector('#email-error');

  const checkEmailExistence = () => {
    const request = new Request(window.location.origin + '/backend/email', {
      method: 'POST',
      body: JSON.stringify({email: email}),
      headers: new Headers({
        'Content-Type': 'x-www-form-urlencoded',
        'X-CSRFToken': getCookie("csrftoken")
      })
    });
    return fetch(request)
      .then((response) => response.json())
      .then((email) => {
        return email['exists'];
      });
  }

  if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    displayError(errorContainer, 'Invalid email address.');
  } else if (await checkEmailExistence()) {
    displayError(errorContainer, 'Email is already registered.');
  } else {
    errorContainer.classList.replace('d-block', 'd-none');
  }
}

export async function validatePassword(element) {
  const registerForm = document.querySelector('.authentication[action="/register"]');
  const isConfirmation = element.name === 'confirmation';
  const password = element.value;
  const errorContainer = element.parentElement.querySelector('.form-error');

  if (!isConfirmation) {
    if (password && password.length < 8) {
      displayError(errorContainer, 'Password must be at least 8 characters long.');
    } else {
      errorContainer.classList.replace('d-block', 'd-none');
    }
  } else {
    if (element.value !== registerForm.querySelector('[type="password"][name="password"]').value) {
      displayError(errorContainer, 'Passwords must match.')
    } else {
      errorContainer.classList.replace('d-block', 'd-none');
    }
  }
}
