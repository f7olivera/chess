/// <reference types="Cypress" />
import {URL} from "./index.js";
import {checkUserExistence} from "../../static/js/misc/misc";

// context('Authentication', authenticationSuiteCase);

export default function authenticationSuiteCase() {

  before(() => {
    cy.visit(URL);
  });

  describe('Register', () => {
    it('open register form webpage', () => {
      cy.get('.nav-link').contains(/log in/i).click();
      cy.get('[href="/register"]').click();
    });

    it('form validation', () => {})

    it('fill in valid form', () => {
      const getUsername = async (username) => {
        if (await checkUserExistence()) {
          await getUsername(`${username}${Math.round(Math.random() * 9)}`)
        } else {
          return username;
        }
      }
      cy.get('.authentication').then((form) => {
        getUsername('random_user').then((username) => console.log(username));
        cy.wrap(form).get('[name="username"]').type("username");
        // cy.wrap(form).find('#user-error').then((error) => {
        //   if (error.is(':visible')) {
        //     cy.wrap(form).get('[name="username"]').type('random_user');
        //   }
        // })
        cy.wrap(form).get('[name="email"]').type('random@gmail.com');
        cy.wrap(form).get('[name="password"]').type('password123');
        cy.wrap(form).get('[name="confirmation"]').type('password123');
      })
    });

    it('register', () => {
      cy.get('.authentication').find('.btn').click();
      cy.get('.user').contains('random_user').should('be.visible');
    });

  });
}