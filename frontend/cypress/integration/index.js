/// <reference types="Cypress" />

const URL = '192.168.0.30:8000';

context('Memotest', () => {

  before(() => {
    cy.visit(URL);
  });

  describe('Play with a friend', () => {
    it('create game', () => {
      cy.get('#navbarDropdown').contains(/play/i).click();
      cy.contains(/with a friend/i).should('be.visible').then((elem) => {
        elem[0].click();
        cy.get('#new-game-form').should('be.visible');
        cy.get('#new-game-form').find('.play_as_white').click();
        cy.url().should('match', /play\/([a-zA-Z\d]){7}/);
        cy.contains(/waiting for/i).should('be.visible');
      });
      
    });
    
  });

});
