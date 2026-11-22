// Keep browser tests independent of the public OpenStreetMap tile service.
export const stubMapTiles = () => {
  cy.intercept('GET', 'https://tile.openstreetmap.org/**', {
    statusCode: 200,
    headers: { 'content-type': 'image/svg+xml' },
    fixture: 'mapTile.svg'
  })
}
