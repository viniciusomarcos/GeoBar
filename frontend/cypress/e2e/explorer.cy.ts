import places from '../../public/data/bars.json'
import { stubMapTiles } from '../support/mapTiles'

beforeEach(stubMapTiles)

describe('Catalog request states', () => {
  it('shows a skeleton until the catalog arrives', () => {
    cy.intercept('GET', '/data/bars.json', { body: places, delay: 800 }).as(
      'catalog'
    )
    cy.visit('/#explore')
    cy.get('[aria-busy="true"] .skeleton-map').should('be.visible')
    cy.get('[role="status"]').should('have.text', 'Carregando bares…')
    cy.contains('h3', 'Nenhum lugar encontrado').should('not.exist')
    cy.screenshot('catalogLoading', { capture: 'viewport' })

    cy.wait('@catalog')

    cy.get('[aria-busy="false"]').should('exist')
    cy.get('article').should('have.length', 3)
    cy.get('.skeleton').should('not.exist')
  })

  it('offers retry and an error toast while retaining the requested filters', () => {
    cy.intercept('GET', '/data/bars.json', { statusCode: 503 }).as(
      'unavailable'
    )
    cy.visit('/?q=Quintal&neighborhood=Savassi#explore')
    cy.wait('@unavailable')
    cy.contains('h3', 'Não foi possível carregar os bares').should('be.visible')
    cy.get('[role="alert"]').should(
      'contain.text',
      'Os bares não puderam ser carregados'
    )
    cy.contains('h3', 'Nenhum lugar encontrado').should('not.exist')
    cy.screenshot('catalogError', { capture: 'viewport' })
    cy.get('button[aria-label="Fechar notificação"]').click()
    cy.get('[role="alert"]').should('not.exist')

    cy.intercept('GET', '/data/bars.json', { body: places, delay: 300 }).as(
      'recovered'
    )
    cy.contains('button', 'Tentar novamente').click()
    cy.get('[aria-busy="true"]').should('exist')
    cy.wait('@recovered')

    cy.get('input[type="search"]').should('have.value', 'Quintal')
    cy.contains('button', 'Savassi').should('have.attr', 'aria-pressed', 'true')
    cy.get('article').should('have.length', 1)
    cy.contains('h3', 'Quintal do Sol').should('be.visible')
    cy.get('[role="alert"]').should('not.exist')
    cy.location('search').should('include', 'q=Quintal')
  })

  it('treats a malformed response as an error instead of an empty catalog', () => {
    cy.intercept('GET', '/data/bars.json', {
      body: [{ ...places[0], position: [null, null] }]
    })
    cy.visit('/#explore')
    cy.contains('h3', 'Não foi possível carregar os bares').should('be.visible')
    cy.contains('button', 'Tentar novamente').should('be.visible')
    cy.get('article').should('not.exist')
  })

  it('shows an empty state after a successful empty response', () => {
    cy.intercept('GET', '/data/bars.json', { body: [] })
    cy.visit('/#explore')
    cy.contains('h3', 'Nenhum lugar encontrado').should('be.visible')
    cy.get('[role="status"]').should('have.text', '0 bares')
    cy.get('article').should('not.exist')
    cy.get('[role="alert"]').should('not.exist')
    cy.get('nav[aria-label="Páginas de resultados de bares"]').should(
      'not.exist'
    )
  })
})

describe('Search navigation and pagination', () => {
  it('debounces consecutive edits and searches without submitting the form', () => {
    cy.visit('/#explore')
    cy.get('article').should('have.length', 3)
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout'])
    cy.get('input[type="search"]').type('Quin', { delay: 0 })
    cy.tick(299)
    cy.get('article').should('have.length', 3)
    cy.get('input[type="search"]').type('tal', { delay: 0 })
    cy.tick(299)
    cy.get('article').should('have.length', 3)

    cy.tick(1)

    cy.get('article').should('have.length', 1)
    cy.contains('h3', 'Quintal do Sol').should('be.visible')
    cy.location('search').should('include', 'q=Quintal')
  })

  it('cancels pending typing when returning to a previous search', () => {
    cy.visit('/?q=Casa#explore')
    cy.get('article').should('have.length', 1)
    cy.get('input[type="search"]').clear().type('Quintal{enter}')
    cy.contains('h3', 'Quintal do Sol').should('be.visible')
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout'])
    cy.get('input[type="search"]').clear().type('balcao', { delay: 0 })

    cy.go('back')
    cy.tick(300)

    cy.get('input[type="search"]').should('have.value', 'Casa')
    cy.contains('h3', 'Casa da Esquina').should('be.visible')
    cy.location('search').should('include', 'q=Casa')
  })

  it('uses fixed pagination without a size selector and ignores former size parameters', () => {
    cy.visit('/?size=2#explore')
    cy.get('article').should('have.length', 3)
    cy.get('.bar-map .map-marker').should('have.length', 3)
    cy.get('select').should('not.exist')
    cy.get('button[aria-label="Página anterior"]').should('be.disabled')
    cy.get('button[aria-label="Próxima página"]').should('be.disabled')
    cy.contains('Página 1 de 1').should('be.visible')
    cy.contains('1–3 de 3 bares').should('be.visible')
    cy.reload()
    cy.get('article').should('have.length', 3)
    cy.contains('button', 'Savassi').click()
    cy.contains('h3', 'Quintal do Sol').should('be.visible')
    cy.location('search').should('not.include', 'size=')
    cy.screenshot('catalogPagination', { capture: 'fullPage' })
  })

  it('returns from a result card with the same search, neighborhood, and scroll position', () => {
    let top = 0
    cy.visit('/?q=Quintal&neighborhood=Savassi#explore')
    cy.get('html').invoke('css', 'scroll-behavior', 'auto')
    cy.get('article').should('have.length', 1)
    cy.get('article .details-link').scrollIntoView()
    cy.window().then((win) => {
      top = win.scrollY
    })
    cy.get('article .details-link').click({ scrollBehavior: false })
    cy.location('pathname').should('eq', '/bars/quintal-do-sol')

    cy.contains('a', 'Voltar para os bares').click()

    cy.location('pathname').should('eq', '/')
    cy.location('search').should('eq', '?q=Quintal&neighborhood=Savassi')
    cy.get('input[type="search"]').should('have.value', 'Quintal')
    cy.contains('button', 'Savassi').should('have.attr', 'aria-pressed', 'true')
    cy.get('select').should('not.exist')
    cy.get('article').should('have.length', 1)
    cy.window().should((win) => expect(win.scrollY).to.be.closeTo(top, 4))
  })

  it('returns from a map popup with the filtered marker still selected', () => {
    cy.visit('/?q=balcao&neighborhood=Floresta#explore')
    cy.contains('a', 'Ver no mapa').click()
    cy.get('.leaflet-popup').contains('a', 'Ver detalhes').click()
    cy.location('pathname').should('eq', '/bars/balcao-da-prosa')

    cy.contains('a', 'Voltar para os bares').click()

    cy.get('input[type="search"]').should('have.value', 'balcao')
    cy.contains('button', 'Floresta').should(
      'have.attr',
      'aria-pressed',
      'true'
    )
    cy.get('article').should('have.length', 1)
    cy.get('.bar-map .map-marker').should('have.length', 1)
    cy.get('.leaflet-popup').should('contain.text', 'Balcão da Prosa')
  })

  it('restores submitted searches with browser back and forward navigation', () => {
    cy.visit('/#explore')
    cy.get('input[type="search"]').type('Quintal{enter}')
    cy.get('article').should('have.length', 1)
    cy.get('input[type="search"]').clear().type('Casa{enter}')
    cy.contains('h3', 'Casa da Esquina').should('be.visible')

    cy.go('back')

    cy.get('input[type="search"]').should('have.value', 'Quintal')
    cy.contains('h3', 'Quintal do Sol').should('be.visible')
    cy.go('forward')
    cy.get('input[type="search"]').should('have.value', 'Casa')
    cy.contains('h3', 'Casa da Esquina').should('be.visible')
  })
})
