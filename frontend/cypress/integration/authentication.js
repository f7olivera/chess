/// <reference types="Cypress" />


export default function authenticationSuiteCase() {

  let username;

  before(() => {
    cy.visit('/');
    cy.request('GET', window.location.origin + '/backend/random_username')
      .then((response) => {
        username = response.body.username;
      });
  });

  beforeEach(() => {
    cy.wrap(username).as('username');
  })

  describe('Register', () => {
    it('open register form', () => {
      cy.get('.nav-link').contains(/log in/i).click();
      cy.get('[href="/register"]').click();
    });

    it('form validation', () => {
    })

    it('fill in valid form', () => {
      cy.get('.authentication').then((form) => {
        cy.get('@username').then((username) => {
          cy.wrap(form).get('[name="username"]').type(`${username}`);
          cy.wrap(form).get('[name="email"]').type(`${username}@gmail.com`);
        });
        cy.wrap(form).get('[name="password"]').type('password123');
        cy.wrap(form).get('[name="confirmation"]').type('password123');
      })
    });

    it('register', () => {
      cy.get('.authentication').find('.btn').click();
      cy.get('@username').then((username) => {
        cy.get('.user').contains(`${username}`).should('be.visible');
      })
    });

  });
}
