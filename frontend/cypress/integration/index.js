/// <reference types="Cypress" />
import playSuiteCase from "./play.js";
import authenticationSuiteCase from "./authentication.js";

export const URL = '192.168.0.30:8000';

// context('Play new game', playSuiteCase);

context('Authentication', authenticationSuiteCase);

