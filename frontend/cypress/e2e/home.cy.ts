const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  describe(`Home page (${viewport.name})`, () => {
    beforeEach(() => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/en')
    })

    it('introduces GeoBar and opens the demo collection', () => {
      cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
      cy.document()
        .its('documentElement.scrollWidth')
        .should('be.lte', viewport.width)
      // Prevent smooth scrolling from distorting full-page screenshot stitching.
      cy.get('html').invoke('css', 'scroll-behavior', 'auto')
      cy.screenshot(`home-en-${viewport.name}`, { capture: 'fullPage' })
      cy.contains('a', 'Find your next spot').click()

      cy.location('hash').should('eq', '#explore')
      cy.get('input[type="search"]').should('be.visible')
      cy.get('article').should('have.length', 3)
      cy.contains('These fictional places').should('be.visible')
    })

    it('finds a place by name with keyboard submission', () => {
      cy.get('input[type="search"]').type('balcao{enter}')

      cy.get('article').should('have.length', 1)
      cy.contains('h3', 'Balcão da Prosa').should('be.visible')
      cy.get('[role="status"]').should('have.text', '1 demo place')
    })

    it('filters the collection by neighborhood', () => {
      cy.contains('button', 'Savassi').click()

      cy.get('article').should('have.length', 1)
      cy.contains('h3', 'Quintal do Sol').should('be.visible')
      cy.contains('button', 'Savassi').should(
        'have.attr',
        'aria-pressed',
        'true'
      )
    })

    it('recovers from an empty search by clearing all filters', () => {
      cy.get('input[type="search"]').type('Quintal')
      cy.contains('button', /^Search$/).click()
      cy.contains('button', 'Floresta').click()

      cy.contains('h3', 'No places found').should('be.visible')
      cy.get('[role="status"]').should('have.text', '0 demo places')
      cy.contains('button', 'Clear filters').click()

      cy.get('input[type="search"]').should('have.value', '')
      cy.get('article').should('have.length', 3)
      cy.contains('button', 'All neighborhoods').should(
        'have.attr',
        'aria-pressed',
        'true'
      )
    })

    it('lets keyboard users skip navigation and reach the main content', () => {
      cy.press(Cypress.Keyboard.Keys.TAB)
      cy.get('a[href="#main-content"]').should('have.focus')
      cy.press(Cypress.Keyboard.Keys.ENTER)

      cy.get('main').should('have.focus')
      cy.location('hash').should('eq', '#main-content')
    })

    it('switches to Portuguese and preserves the locale after reloading', () => {
      cy.get('a[hreflang="pt"]').click()

      cy.location('pathname').should('eq', '/pt')
      cy.get('html').should('have.attr', 'lang', 'pt')
      cy.title().should('eq', 'GeoBar — Encontre seu próximo buteco')
      cy.contains('h1', 'Encontre seu próximo buteco.').should('be.visible')
      cy.document()
        .its('documentElement.scrollWidth')
        .should('be.lte', viewport.width)
      cy.get('html').invoke('css', 'scroll-behavior', 'auto')
      cy.screenshot(`home-pt-${viewport.name}`, { capture: 'fullPage' })
      cy.reload()
      cy.contains('button', 'Todos os bairros').should('be.visible')

      cy.get('input[type="search"]').type('musica ao vivo{enter}')
      cy.get('article').should('have.length', 1)
      cy.get('[role="status"]').should('have.text', '1 lugar de demonstração')
      cy.contains('button', 'Limpar filtros').click()
      cy.get('[role="status"]').should('have.text', '3 lugares de demonstração')
    })

    it('switches back to English', () => {
      cy.visit('/pt')
      cy.get('a[hreflang="en"]').click()

      cy.location('pathname').should('eq', '/en')
      cy.get('html').should('have.attr', 'lang', 'en')
      cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
      cy.title().should('eq', 'GeoBar — Find your kind of buteco')
    })
  })
}

describe('Default locale', () => {
  it('uses English at the root even when the browser requests Portuguese', () => {
    cy.visit({ url: '/', headers: { 'Accept-Language': 'pt-BR' } })

    cy.location('pathname').should('eq', '/en')
    cy.get('html').should('have.attr', 'lang', 'en')
  })
})
