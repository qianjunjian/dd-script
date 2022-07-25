const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const path = require("path");
var requireContext = require('require-context');

const routePath = path.resolve(process.cwd(), './mocks')
const files = requireContext(routePath, true, /\.js$/)

const handler = async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*"); // 规定允许访问该资源的外域 URI
  ctx.set("Access-Control-Allow-Methods", "GET"); // 请求方式
  ctx.set("Access-Control-Max-Age", "3600"); // 设定预检请求结果的缓存时间
  ctx.set("Access-Control-Allow-Headers", "apk"); // 规定 CORS 请求时会额外发送的头信息字段
  ctx.set("Access-Control-Allow-Credentials", "true"); // 请求可以带 Cookie 等
  
  // 针对预检请求
  if(ctx.request.method == "OPTIONS") {
    ctx.response.stutas = "200"
  }
  
  try {
    await next();
    console.log("处理通过");
  } catch (e) {
    console.log("处理错误");
    ctx.response.status = e.statusCode || err.status || 500;
    ctx.response.body = {
      message: e.message
    }
  }
}

// error handler
onerror(app)

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
})

app.use(handler);

files.keys().forEach(key => {
  let value = files(key).default || files(key)
  app.use(value.routes(), value.allowedMethods())
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
