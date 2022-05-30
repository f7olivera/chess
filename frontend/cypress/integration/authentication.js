/// <reference types="Cypress" />
import {URL} from "./index.js";
import {checkUserExistence, getCookie} from "../../static/js/utils/misc";

// context('Authentication', authenticationSuiteCase);

export default function authenticationSuiteCase() {

  let fetchPolyfill;

  before(() => {
    cy.visit('/');
    // before(() => {
    //   const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js';
    //
    //   cy.request(polyfillUrl)
    //     .then((response) => {
    //       fetchPolyfill = response.body;
    //     });
    //
    //   // cy.server();
    //   // cy.route('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20', 'fixture:listado-pagina-1')
    //   //   .as('obtenerPrimeraPagina');
    //
    //   cy.visit('/', {
    //     onBeforeLoad(contentWindow) {
    //       delete contentWindow.fetch;
    //       contentWindow.eval(fetchPolyfill);
    //       contentWindow.fetch = contentWindow.unfetch;
    //     },
    //   });
    // });
  });

  describe('Register', () => {
    it('open register form webpage', () => {
      cy.get('.nav-link').contains(/log in/i).click();
      cy.get('[href="/register"]').click();
    });

    it('form validation', () => {
    })

    // console.log(username)
    // if (await checkUserExistence(username)) {
    //   await getUsername(`${username}${Math.round(Math.random() * 9)}`)
    // } else {
    //   return username;
    // }
    it('fill in valid form', () => {
      const getUsername = async (username) => {
        cy.request('POST',
          window.location.origin + '/backend/user',
          JSON.stringify({username: username})).then((response) => console.log(response.json()));
      }
      const username = getUsername('random_user');
      cy.get('.authentication').then((form) => {
        username.then((username) => {
          console.log(typeof username)
          cy.wrap(username).as('username')
          cy.wrap(form).get('[name="username"]').type('username');
          cy.wrap(form).get('[name="email"]').type(`${username}@gmail.com`);
        });
        // cy.wrap(form).find('#user-error').then((error) => {
        //   if (error.is(':visible')) {
        //     cy.wrap(form).get('[name="username"]').type('random_user');
        //   }
        // })
        cy.wrap(form).get('[name="password"]').type('password123');
        cy.wrap(form).get('[name="confirmation"]').type('password123');
      })
    });

    it('register', () => {
      cy.get('.authentication').find('.btn').click();
      username.then((username) => {
        cy.get('.user').contains(username).should('be.visible');
      })
    });

  });
}
