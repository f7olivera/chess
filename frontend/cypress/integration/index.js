/// <reference types="Cypress" />

const URL = '192.168.0.30:8000';

context('Play new game', () => {

  before(() => cy.visit(URL));

  describe('Play with a friend', () => {
    it.skip('create game', () => {
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

  describe('Play with Stockfish', () => {
    before(() => cy.visit(URL));
    it.skip('create game', () => {
      cy.get('#navbarDropdown').contains(/play/i).click();
      cy.contains(/with the computer/i).should('be.visible').then((elem) => {
        elem[0].click();
        cy.get('#new-stockfish-game-form').should('be.visible');
        cy.get('#new-stockfish-game-form').find('.play_as_white').click();
        cy.url().should('match', /play\/stockfish/);
      });
    });
    it.skip('make move', () => {
      // cy.get('.game').find('.coord-e2').drag
      cy.get('.game').find('.coord-e2').then((e2_square) => {
        const e2_position = e2_square[0].getBoundingClientRect();
        cy.get('.game').find('.coord-e4').then((e4_square) => {
          const e4_position = e4_square[0].getBoundingClientRect();
          console.log(e2_position.x, e2_position.y)
          console.log(e4_position.x, e4_position.y)
          cy.wrap(e2_square.find('.pw')).click()
          cy.wrap(e4_square).click();
          // .trigger('mousedown', {which: 1})
          // .trigger('mousemove', {
          //   // pageX: e4_position.x,
          //   // pageY: e4_position.y,
          //   clientX: e4_position.x,
          //   clientY: e4_position.y,
          //   // screenX: e4_position.x,
          //   // screenY: e4_position.y
          // })
          // .trigger('mouseup', {which: 1})
        });
      });
      cy.get('.game').find('.coord-e4').find('.pw').should('be.visible');
      cy.get('.game').find('.coord-e2').find('.piece:visible').should('not.exist');
    });

    it.skip('Stockfish responds', () => {
      cy.get('.last-move').find('[data-color="b"]').should('be.visible');
    });

    it.skip('Flips board', () => {
      const colNames = 'abcdefgh';
      cy.get('.game').find('.board').find('.board-row').each((row, i) => {
        cy.wrap(row[0].children).each((square, j) => {
          cy.wrap(square[0]).should('have.class', `coord-${colNames[j]}${8 - i}`)
        })
      })
      cy.get('.flip-button').click();
      cy.get('.game').find('.board').find('.board-row').each((row, i) => {
        cy.wrap(row[0].children).each((square, j) => {
          cy.wrap(square[0]).should('have.class', `coord-${colNames[8 - j - 1]}${i + 1}`)
        })
      })
    });
  });


});
