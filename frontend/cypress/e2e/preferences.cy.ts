import en from '../../messages/en.json'
import { stubMapTiles } from '../support/mapTiles'

beforeEach(stubMapTiles)

describe('Preferences across entry points', () => {
  it('restores English and dark mode when opening a bar details URL directly', () => {
    cy.visit('/bars/quintal-do-sol', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('geobar.locale', 'en')
        win.localStorage.setItem('geobar.theme', 'dark')
      }
    })

    cy.contains('h1', 'Quintal do Sol').should('be.visible')
    cy.contains('h2', 'About the bar').should('be.visible')
    cy.contains(en.Places['quintal-do-sol'].hours).should('be.visible')
    cy.get('html')
      .should('have.attr', 'lang', 'en')
      .and('have.attr', 'data-theme', 'dark')
    cy.title().should('eq', 'Quintal do Sol — GeoBar')
    cy.get('.bar-map .map-marker')
      .should('have.length', 1)
      .and('have.attr', 'title', 'Quintal do Sol')
    cy.contains('a', 'Back to the bars').click()
    cy.location('pathname').should('eq', '/')
    cy.get('[role="status"]').should('have.text', '3 bars')
    cy.get('html').should('have.attr', 'data-theme', 'dark')
  })

  it('falls back from unsupported stored values and saves valid replacements', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('geobar.locale', 'es')
        win.localStorage.setItem('geobar.theme', 'system')
      }
    })

    cy.contains('h1', 'Encontre seu próximo buteco.').should('be.visible')
    cy.get('html')
      .should('have.attr', 'lang', 'pt')
      .and('have.attr', 'data-theme', 'light')
    cy.get('button[aria-label="English"]').click()
    cy.get('[role="switch"]').click()
    cy.get('html')
      .should('have.attr', 'lang', 'en')
      .and('have.attr', 'data-theme', 'dark')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'geobar.locale')
      .should('eq', 'en')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'geobar.theme')
      .should('eq', 'dark')
  })

  it('keeps language, theme, and search usable when browser storage is blocked', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        cy.stub(win.Storage.prototype, 'getItem').callsFake(() => {
          throw new Error('Storage blocked')
        })
        cy.stub(win.Storage.prototype, 'setItem').callsFake(() => {
          throw new Error('Storage blocked')
        })
      }
    })

    cy.get('button[aria-label="English"]').click()
    cy.get('[role="switch"]').click()
    cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
    cy.get('html')
      .should('have.attr', 'lang', 'en')
      .and('have.attr', 'data-theme', 'dark')
    cy.get('input[type="search"]').type('quintal{enter}')
    cy.get('article').should('have.length', 1)
    cy.contains('h3', 'Quintal do Sol').should('be.visible')
    cy.get('[role="switch"]').click()
    cy.get('html').should('have.attr', 'data-theme', 'light')
  })

  it('localizes an unknown bar and preserves preferences when returning to the collection', () => {
    cy.visit('/bars/not-a-bar', {
      failOnStatusCode: false,
      onBeforeLoad: (win) => {
        win.localStorage.setItem('geobar.locale', 'en')
        win.localStorage.setItem('geobar.theme', 'dark')
      }
    })

    cy.contains('h1', 'This place is off the map.').should('be.visible')
    cy.title().should('eq', en.NotFound.pageTitle)
    cy.contains('a', 'Explore bars').click()
    cy.location('pathname').should('eq', '/')
    cy.location('hash').should('eq', '#explore')
    cy.title().should('eq', en.Metadata.title)
    cy.get('[role="status"]').should('have.text', '3 bars')
    cy.get('html')
      .should('have.attr', 'lang', 'en')
      .and('have.attr', 'data-theme', 'dark')
  })

  it('keeps the correct bar and localized metadata through browser back and forward navigation', () => {
    cy.visit('/')
    cy.contains('h3', 'Casa da Esquina')
      .contains('a', 'Casa da Esquina')
      .click()
    cy.location('pathname').should('eq', '/bars/casa-da-esquina')
    cy.get('button[aria-label="English"]').click()
    cy.get('[role="switch"]').click()
    cy.contains('a', 'Back to the bars').click()
    cy.location('pathname').should('eq', '/')

    cy.go('back')

    cy.location('pathname').should('eq', '/bars/casa-da-esquina')
    cy.contains('h1', 'Casa da Esquina').should('be.visible')
    cy.contains('h2', 'About the bar').should('be.visible')
    cy.title().should('eq', 'Casa da Esquina — GeoBar')
    cy.get('html').should('have.attr', 'data-theme', 'dark')

    cy.go('forward')

    cy.location('pathname').should('eq', '/')
    cy.title().should('eq', en.Metadata.title)
    cy.get('html')
      .should('have.attr', 'lang', 'en')
      .and('have.attr', 'data-theme', 'dark')
    cy.get('article').should('have.length', 3)
  })
})
