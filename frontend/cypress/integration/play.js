import {URL} from "./index";

// context('Play new game', playSuiteCase);

export default function playSuiteCase() {

  before(() => {
    cy.visit(URL);
  });

  describe('Play with a friend', () => {
    it('click play dropdown', () => {
    });

    it('create game', () => {
      cy.get('#navbarDropdown').contains(/play/i).click();
      cy.contains(/with a friend/i).should('be.visible').then((elem) => {
        elem[0].click();
        cy.get('#new-game-form').should('be.visible');
        fenFieldValidation('#new-game-form');
        cy.get('#new-game-form').find('.play_as_white').click();
        cy.url().should('match', /play\/([a-zA-Z\d]){7}/);
      });
    });

    it('shows waiting message', () => {
      cy.contains(/waiting for/i).should('be.visible');
    });
  });

  describe('Play with Stockfish', () => {
    before(() => cy.visit(URL));
    it('create game', () => {
      cy.get('#navbarDropdown').contains(/play/i).click();
      cy.contains(/with the computer/i).should('be.visible').then((elem) => {
        elem[0].click();
        cy.get('#new-stockfish-game-form').should('be.visible');
        cy.get('#new-stockfish-game-form').find('.play_as_white').click();
        cy.url().should('match', /play\/stockfish/);
      });
    });
    it('make move', () => {
      testMove('e2e4');
    });

    it('Stockfish responds', () => {
      cy.get('#game-actions').find('.stockfish-thinking-time').then((thinkingTime) => cy.wait(500 + parseInt(thinkingTime.text())));
      cy.get('.last-move').find('.piece:visible').should('have.data', 'color', 'b');
    });

    it('Flips board', testBoardFlip);
  });

  describe('Play over the board', () => {
    before(() => cy.visit(URL));

    it('create game', () => {
      cy.get('#navbarDropdown').contains(/play/i).click();
      cy.contains(/over the board/i).should('be.visible').then((elem) => elem[0].click());
    });

    it('make pawn moves', () => {
      testMove('e2e4');
      testMove('d7d5');
    });

    it('captures', () => {
      testMove('e4d5');
      testMove('d8d5');
      testMove('h2h4');
      testMove('g7g5');
      testMove('h4g5');
      testMove('d5g2');
      testMove('g5g6');
      testMove('g2g1');
      testMove('g6g7');
      testMove('g1h1');
    });

    it('promotion', () => testMove('g7h8', 'q'));

    it('Flips board', testBoardFlip);
  });
}

function testMove(uci, promotion) {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const piece = cy.get('.game').find(`.coord-${from}`).find('.piece:visible');

  cy.get('.game').find(`.coord-${from}`).then((fromSquare) => {
    const pieceColor = fromSquare.find('.piece:visible').attr('data-color');
    const pieceData = fromSquare.find('.piece:visible').attr('data-piece');
    cy.get('.game').find(`.coord-${to}`).then((toSquare) => {
      // Makes move
      cy.wrap(fromSquare.find('.piece:visible')).click()
      cy.wrap(toSquare).click();
      promotion && cy.get(`.promotion.${promotion}${pieceColor}:visible`).click();
    });
    if (promotion) {
      cy.get('.game').find(`.coord-${to}`).find(`.${promotion}${pieceColor}:visible`).should('be.visible');
    } else {
      cy.get('.game').find(`.coord-${to}`).find(`.${pieceData}:visible`).should('be.visible');
    }
    cy.wrap(fromSquare.find('.piece:visible')).should('not.exist');
  });
  piece.then(a => console.log(a[0]))
}

function fenFieldValidation(selector) {
  cy.get(selector).then((form) => {
    form.find('')
  })
}

function testBoardFlip() {
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
}