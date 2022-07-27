const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const path = require("path");
var requireContext = require('require-context');
var cors = require("koa2-cors")

const routePath = path.resolve(process.cwd(), './mocks')
const files = requireContext(routePath, true, /\.js$/)

// error handler
onerror(app)

app.use(cors())

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(process.cwd() + '/public'))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  console.log(``)
})

files.keys().forEach(key => {
  let value = files(key).default || files(key)
  app.use(value.routes(), value.allowedMethods())
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
