import bars from '../fixtures/apiBars.json'
import { stubMapTiles } from '../support/mapTiles'

beforeEach(stubMapTiles)

describe('API bar details in a production build', () => {
  it('renders a numeric identifier on the server before hydration', () => {
    cy.request(`/bars/${bars[0].id}`).then(({ status, body }) => {
      const document = new DOMParser().parseFromString(body, 'text/html')
      expect(status).to.eq(200)
      expect(document.querySelector('h1')?.textContent).to.eq(bars[0].name)
      expect(document.title).to.eq(`${bars[0].name} — GeoBar`)
    })
  })

  it('opens a card and returns to the same search', () => {
    cy.visit('/?q=Casa#explore')
    cy.get('article').should('have.length', 1)
    cy.get('article').should(($card) => {
      expect($card[0].getBoundingClientRect().height).to.be.greaterThan(200)
    })
    cy.contains('article', bars[0].name).contains('a', 'Ver detalhes').click()
    cy.location('pathname').should('eq', `/bars/${bars[0].id}`)
    cy.contains('h1', bars[0].name).should('be.visible')

    cy.contains('a', 'Voltar para os bares').click()

    cy.get('input[type="search"]').should('have.value', 'Casa')
    cy.get('article').should('have.length', 1)
    cy.contains('h3', bars[0].name).should('be.visible')
  })

  it('opens numeric details from a map popup', () => {
    cy.visit('/')
    cy.contains('article', bars[1].name).contains('a', 'Ver no mapa').click()
    cy.get('.leaflet-popup').contains('a', 'Ver detalhes').click()

    cy.location('pathname').should('eq', `/bars/${bars[1].id}`)
    cy.contains('h1', bars[1].name).should('be.visible')
    cy.contains(bars[1].address).should('be.visible')
    cy.get('.bar-map .map-marker').should('have.length', 1)
    cy.get('.details-content').should(($content) => {
      const map = $content.find('.map-panel')[0].getBoundingClientRect()
      const information = $content
        .find('.bar-information')[0]
        .getBoundingClientRect()
      expect(Math.abs(map.top - information.top)).to.be.lessThan(1)
    })
  })

  it('translates API categories and preserves preferences on reload', () => {
    cy.visit(`/bars/${bars[1].id}`)
    cy.contains('Cervejaria ao ar livre').should('be.visible')
    cy.contains('h2', 'Horários').should('not.exist')
    cy.get('button[aria-label="English"]').click()
    cy.contains('Beer garden').should('be.visible')
    cy.get('[role="switch"]').click()
    cy.reload()
    cy.contains('h1', bars[1].name).should('be.visible')
    cy.contains('Beer garden').should('be.visible')
    cy.contains('h2', 'Hours').should('not.exist')
    cy.get('html')
      .should('have.attr', 'lang', 'en')
      .and('have.attr', 'data-theme', 'dark')
  })

  for (const id of ['999999', 'not-a-bar']) {
    it(`returns 404 for the missing API identifier ${id}`, () => {
      cy.request({ url: `/bars/${id}`, failOnStatusCode: false })
        .its('status')
        .should('eq', 404)
      cy.visit({ url: `/bars/${id}`, failOnStatusCode: false })
      cy.contains('h1', 'Esse lugar ficou fora do mapa.').should('be.visible')
      cy.contains('a', 'Explorar bares').click()
      cy.get('article').should('have.length', bars.length)
    })
  }
})
