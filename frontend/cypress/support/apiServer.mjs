import { createServer } from 'node:http'
import bars from '../fixtures/apiBars.json' with { type: 'json' }

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4173')
  const { pathname } = new URL(request.url, 'http://127.0.0.1:4174')
  if (pathname === '/health') {
    response.end(JSON.stringify({ status: 'ok' }))
    return
  }
  if (pathname === '/bars/all') {
    response.end(JSON.stringify(bars))
    return
  }
  const bar = bars.find(({ id }) => pathname === `/bars/${id}`)
  if (bar) {
    response.end(JSON.stringify(bar))
    return
  }
  response.writeHead(404)
  response.end(JSON.stringify({ detail: 'Bar not found' }))
})

server.listen(4174, '127.0.0.1')
