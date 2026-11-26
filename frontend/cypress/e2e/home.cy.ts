import en from '../../messages/en.json'
import pt from '../../messages/pt.json'
import { stubMapTiles } from '../support/mapTiles'

const expectMetadata = ({
  title,
  description
}: {
  title: string
  description: string
}) => {
  cy.get('head title').should('have.length', 1).and('have.text', title)
  cy.get('head meta[name="description"]')
    .should('have.length', 1)
    .and('have.attr', 'content', description)
}

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 }
]

beforeEach(stubMapTiles)

for (const viewport of viewports) {
  describe(`Home page (${viewport.name})`, () => {
    beforeEach(() => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/')
    })

    it('defaults to Portuguese light mode with a compact header and flag buttons', () => {
      cy.contains('h1', 'Encontre seu próximo buteco.').should('be.visible')
      cy.location('pathname').should('eq', '/')
      cy.get('html')
        .should('have.attr', 'lang', 'pt')
        .and('have.attr', 'data-theme', 'light')
      cy.get('header').within(() => {
        cy.get('button[aria-label="Português"]')
          .should('have.attr', 'aria-pressed', 'true')
          .find('img')
          .should('be.visible')
        cy.get('button[aria-label="English"]').find('img').should('be.visible')
        cy.contains('A ideia').should('not.exist')
        cy.contains('Explore o GeoBar').should('not.exist')
      })
      cy.document()
        .its('documentElement.scrollWidth')
        .should('be.lte', viewport.width)
      cy.contains('Lugares fictícios').should('not.exist')
      cy.contains('Dados de demonstração.').should('not.exist')
      cy.get('.bar-map .map-marker').should('have.length', 3)
      cy.get('.bar-map .leaflet-tile-loaded').should(
        'have.length.greaterThan',
        0
      )
      cy.get('.bar-map .leaflet-tile-loaded').should('have.css', 'opacity', '1')
      cy.get('html').invoke('css', 'scroll-behavior', 'auto')
      cy.screenshot(`home-pt-light-${viewport.name}`, { capture: 'fullPage' })
    })

    it('switches languages without navigation and restores the language after reloading', () => {
      cy.get('button[aria-label="English"]').click()
      cy.location('pathname').should('eq', '/')
      cy.get('html').should('have.attr', 'lang', 'en')
      cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
      expectMetadata(en.Metadata)
      cy.reload()
      cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
      expectMetadata(en.Metadata)
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'geobar.locale')
        .should('eq', 'en')
      cy.get('button[aria-label="Português"]').click()
      cy.contains('h1', 'Encontre seu próximo buteco.').should('be.visible')
      expectMetadata(pt.Metadata)
    })

    it('saves dark mode independently of language and returns to light mode', () => {
      cy.get('[role="switch"]')
        .click()
        .should('have.attr', 'aria-checked', 'true')
      cy.get('html').should('have.attr', 'data-theme', 'dark')
      cy.reload()
      cy.get('html').should('have.attr', 'data-theme', 'dark')
      cy.get('button[aria-label="English"]').click()
      cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
      cy.get('html').should('have.attr', 'data-theme', 'dark')
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'geobar.theme')
        .should('eq', 'dark')
      cy.reload()
      cy.contains('h1', 'Find your kind of buteco.').should('be.visible')
      cy.get('[role="switch"]').should('have.attr', 'aria-checked', 'true')
      cy.get('html').should('have.attr', 'data-theme', 'dark')
      cy.get('.bar-map .map-marker').should('have.length', 3)
      cy.get('html').invoke('css', 'scroll-behavior', 'auto')
      cy.screenshot(`home-en-dark-${viewport.name}`, { capture: 'fullPage' })
      cy.get('[role="switch"]')
        .click()
        .should('have.attr', 'aria-checked', 'false')
      cy.get('html').should('have.attr', 'data-theme', 'light')
    })

    it('uses one visible focus indicator for the search field', () => {
      cy.get('input[type="search"]')
        .focus()
        .should('have.css', 'outline-style', 'none')
      cy.get('.search-form').should('have.css', 'outline-style', 'solid')
    })

    it('finds a place by name and updates the map markers', () => {
      cy.get('input[type="search"]').type('balcao')
      cy.get('article').should('have.length', 1)
      cy.contains('h3', 'Balcão da Prosa').should('be.visible')
      cy.get('[role="status"]').should('have.text', '1 bar')
      cy.get('.bar-map .map-marker')
        .should('have.length', 1)
        .and('have.attr', 'title', 'Balcão da Prosa')
    })

    it('filters places and markers by neighborhood', () => {
      cy.contains('button', 'Savassi').click()
      cy.get('article').should('have.length', 1)
      cy.contains('h3', 'Quintal do Sol').should('be.visible')
      cy.contains('button', 'Savassi').should(
        'have.attr',
        'aria-pressed',
        'true'
      )
      cy.get('.bar-map .map-marker')
        .should('have.length', 1)
        .and('have.attr', 'title', 'Quintal do Sol')
    })

    it('removes only the neighborhood restriction when all neighborhoods is selected', () => {
      cy.get('input[type="search"]').type('Quintal{enter}')
      cy.contains('button', 'Floresta').click()
      cy.get('article').should('not.exist')
      cy.get('.bar-map .map-marker').should('not.exist')

      cy.contains('button', 'Todos os bairros').click()

      cy.get('input[type="search"]').should('have.value', 'Quintal')
      cy.get('article').should('have.length', 1)
      cy.contains('h3', 'Quintal do Sol').should('be.visible')
      cy.contains('button', 'Todos os bairros').should(
        'have.attr',
        'aria-pressed',
        'true'
      )
      cy.get('.bar-map .map-marker')
        .should('have.length', 1)
        .and('have.attr', 'title', 'Quintal do Sol')
    })

    it('clears a search with whitespace while keeping the neighborhood selected', () => {
      cy.contains('button', 'Savassi').click()
      cy.get('input[type="search"]').type('Casa{enter}')
      cy.get('article').should('not.exist')

      cy.get('input[type="search"]').clear().type('   {enter}')

      cy.get('article').should('have.length', 1)
      cy.contains('h3', 'Quintal do Sol').should('be.visible')
      cy.contains('button', 'Savassi').should(
        'have.attr',
        'aria-pressed',
        'true'
      )
      cy.get('.bar-map .map-marker')
        .should('have.length', 1)
        .and('have.attr', 'title', 'Quintal do Sol')
      cy.contains('button', 'Todos os bairros').click()
      cy.get('article').should('have.length', 3)
      cy.get('.bar-map .map-marker').should('have.length', 3)
      cy.contains('button', 'Limpar filtros').should('not.exist')
    })

    it('keeps active filters and translates the selected result when changing language', () => {
      cy.get('input[type="search"]').type('balcao{enter}')
      cy.contains('button', 'Floresta').click()
      cy.get('article').should('have.length', 1)

      cy.get('button[aria-label="English"]').click()

      cy.get('input[type="search"]').should('have.value', 'balcao')
      cy.contains('button', 'Floresta').should(
        'have.attr',
        'aria-pressed',
        'true'
      )
      cy.get('article')
        .should('have.length', 1)
        .and('contain.text', 'Balcão da Prosa')
        .and('contain.text', 'Pub')
      cy.get('.bar-map .map-marker')
        .should('have.length', 1)
        .and('have.attr', 'title', 'Balcão da Prosa')
      cy.contains('a', 'View on map').click()
      cy.get('.leaflet-popup').should('contain.text', 'Pub')
      cy.location('pathname').should('eq', '/')
    })

    it('clears an empty combined search and restores places and markers', () => {
      cy.get('input[type="search"]').type('Quintal{enter}')
      cy.contains('button', 'Floresta').click()
      cy.contains('h3', 'Nenhum lugar encontrado').should('be.visible')
      cy.get('.bar-map .map-marker').should('not.exist')
      cy.contains('button', 'Limpar filtros').click()
      cy.get('input[type="search"]').should('have.value', '')
      cy.get('article').should('have.length', 3)
      cy.get('.bar-map .map-marker').should('have.length', 3)
    })

    it('opens a marker popup with the fictional place details', () => {
      cy.get('.bar-map').scrollIntoView()
      cy.get('.bar-map .map-marker[title="Casa da Esquina"]').click()
      cy.get('.leaflet-popup')
        .should('be.visible')
        .and('contain.text', 'Casa da Esquina')
        .and('contain.text', 'Santa Tereza')
      cy.get('.leaflet-control-attribution').should(
        'contain.text',
        'OpenStreetMap'
      )
      cy.get('button[aria-label="Aproximar"]').click()
      cy.get('button[aria-label="Afastar"]').click()
      cy.get('button[aria-label="Mostrar todos os resultados"]').click()
      cy.get('.bar-map .map-marker').should('have.length', 3)
    })

    it('opens a place on the map from its result card', () => {
      cy.contains('article', 'Quintal do Sol')
        .contains('a', 'Ver no mapa')
        .click()
      cy.location('hash').should('eq', '#bar-map')
      cy.get('.leaflet-popup')
        .should('be.visible')
        .and('contain.text', 'Quintal do Sol')
    })

    it('opens bar details from a card and preserves preferences across navigation', () => {
      cy.contains('article', 'Casa da Esquina')
        .contains('a', 'Ver detalhes')
        .click()
      cy.location('pathname').should('eq', '/bars/1')
      cy.contains('h1', 'Casa da Esquina').should('be.visible')
      cy.contains('h2', 'Localização').should('be.visible')
      cy.contains('Dados de demonstração.').should('not.exist')
      cy.contains('Tu-Su 17:00-00:00').should('be.visible')
      cy.get('.bar-map .map-marker').should('have.length', 1)
      cy.get('[role="switch"]').click()
      cy.title().should('eq', 'Casa da Esquina — GeoBar')
      cy.get('button[aria-label="English"]').click()
      cy.contains('h2', 'Location').should('be.visible')
      cy.reload()
      cy.contains('Tu-Su 17:00-00:00').should('be.visible')
      cy.get('html').should('have.attr', 'data-theme', 'dark')
      cy.title().should('eq', 'Casa da Esquina — GeoBar')
      cy.document()
        .its('documentElement.scrollWidth')
        .should('be.lte', viewport.width)
      cy.get('html').invoke('css', 'scroll-behavior', 'auto')
      cy.get('.bar-map .leaflet-tile-loaded').should('have.css', 'opacity', '1')
      cy.screenshot(`barDetails${viewport.name}`, { capture: 'fullPage' })
      cy.contains('a', 'Back to the bars').click()
      cy.location('pathname').should('eq', '/')
      cy.location('hash').should('eq', '#explore')
      cy.title().should('eq', 'GeoBar — Find your kind of buteco')
      cy.get('html').should('have.attr', 'data-theme', 'dark')
    })

    it('opens bar details from the map popup', () => {
      cy.get('.bar-map').scrollIntoView()
      cy.get('.bar-map .map-marker[title="Balcão da Prosa"]').click()
      cy.get('.leaflet-popup').contains('a', 'Ver detalhes').click()
      cy.location('pathname').should('eq', '/bars/3')
      cy.contains('h1', 'Balcão da Prosa').should('be.visible')
      cy.contains('Th-Su 18:00-01:00').should('be.visible')
      cy.get('.bar-map .map-marker').should('have.length', 1)
    })

    it('opens bar details from a focused map marker using the keyboard', () => {
      cy.get('.bar-map').scrollIntoView()
      cy.get('.bar-map .map-marker[title="Balcão da Prosa"]')
        .focus()
        .should('have.focus')
      // Leaflet listens for keypress; cy.press only sends keydown and keyup.
      cy.focused().type('{enter}')
      cy.get('.leaflet-popup')
        .should('be.visible')
        .contains('a', 'Ver detalhes')
        .focus()
        .should('have.focus')

      cy.press(Cypress.Keyboard.Keys.ENTER)

      cy.location('pathname').should('eq', '/bars/3')
      cy.contains('h1', 'Balcão da Prosa').should('be.visible')
    })

    it('lets keyboard users skip navigation and reach the main content', () => {
      cy.press(Cypress.Keyboard.Keys.TAB)
      cy.get('a[href="#main-content"]').should('have.focus')
      cy.press(Cypress.Keyboard.Keys.ENTER)
      cy.get('main').should('have.focus')
      cy.location('hash').should('eq', '#main-content')
    })
  })
}

describe('Root route and map availability', () => {
  it('uses Portuguese light mode even when the browser requests English', () => {
    cy.visit({ url: '/', headers: { 'Accept-Language': 'en-US' } })
    cy.location('pathname').should('eq', '/')
    cy.get('html')
      .should('have.attr', 'lang', 'pt')
      .and('have.attr', 'data-theme', 'light')
  })

  for (const locale of ['en', 'pt']) {
    it(`redirects the former /${locale} address to the root`, () => {
      cy.visit(`/${locale}`)
      cy.location('pathname').should('eq', '/')
      cy.contains('h1', 'Encontre seu próximo buteco.').should('be.visible')
    })
  }

  it('keeps fictional markers available when the basemap is offline', () => {
    cy.intercept('GET', 'https://tile.openstreetmap.org/**', {
      statusCode: 503,
      body: ''
    })
    cy.visit('/')
    cy.get('#bar-map').scrollIntoView()
    cy.get('[role="alert"]').should(
      'contain.text',
      'Não foi possível carregar o fundo do mapa'
    )
    cy.get('.bar-map .map-marker').should('have.length', 3)
    cy.get('article').should('have.length', 3)
    cy.get('.bar-map .map-marker[title="Casa da Esquina"]').click()
    cy.get('.leaflet-popup').contains('a', 'Ver detalhes').click()
    cy.location('pathname').should('eq', '/bars/1')
    cy.contains('h1', 'Casa da Esquina').should('be.visible')
    cy.get('.bar-map .map-marker').should('have.length', 1)
  })
})

describe('Missing bar', () => {
  it('returns 404 with a way back to the collection for an unknown identifier', () => {
    cy.request({ url: '/bars/not-a-bar', failOnStatusCode: false })
      .its('status')
      .should('eq', 404)
    cy.visit({ url: '/bars/not-a-bar', failOnStatusCode: false })
    cy.contains('h1', 'Esse lugar ficou fora do mapa.').should('be.visible')
    cy.contains('a', 'Explorar bares').click()
    cy.location('pathname').should('eq', '/')
    cy.get('article').should('have.length', 3)
  })
})

describe('Server-rendered metadata', () => {
  const pages = [
    { url: '/', ...pt.Metadata },
    {
      url: '/bars/1',
      title: 'Casa da Esquina — GeoBar',
      description: 'Rua Mármore, 10, Santa Tereza'
    }
  ]

  for (const page of pages) {
    it(`includes unique localized metadata before hydration at ${page.url}`, () => {
      cy.request(page.url).then(({ body }) => {
        const pageDocument = new DOMParser().parseFromString(body, 'text/html')
        expect(pageDocument.head.querySelectorAll('title')).to.have.length(1)
        expect(pageDocument.title).to.eq(page.title)
        expect(
          pageDocument.head.querySelectorAll('meta[name="description"]')
        ).to.have.length(1)
        expect(
          pageDocument.head
            .querySelector('meta[name="description"]')
            ?.getAttribute('content')
        ).to.eq(page.description)
      })
    })
  }
})
