// core
//----------------------------------------------------
const http = require('http')
const path = require('path')
const fs = require('fs')


// npm
//----------------------------------------------------
const express = require('express')
const morgan = require('morgan')
const favicon = require('serve-favicon')
const multer = require('multer')
const sharp = require('sharp')


// setup
//----------------------------------------------------
const tmpDir = './tmp/image-resize'
const upload = multer({ dest: tmpDir })

const mimetype = {
  'image/png' : 'png',
  'image/jpg' : 'jpg',
}


// application
//----------------------------------------------------
const app = express()
app.set('view engine', 'pug')
app.enable('strict routing')
app.enable('case sensitive routing')
app.disable('x-powered-by')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.static('public'))

app.use(morgan(process.env.ENVIRONMENT === 'production' ? 'combined' : 'dev'))

if (process.env.APEX) {
  console.log(1)
  app.use((req, res, next) => {
    return next() // not working yet
    if (req.headers['x-forwarded-host'] !== process.env.APEX) {
      console.log('https://' + process.env.APEX + req.url)
      res.redirect('https://' + process.env.APEX + req.url)
      return
    }
    next()
  })
}

app.use((req, res, next) => {
  res.locals = {
    projectDomain : process.env.PROJECT_DOMAIN,
    projectId     : process.env.PROJECT_ID,
    title         : 'Image Resizer'
  }
  next()
})

app.get("/", (req, res) => {
  res.render('index')
})

app.post("/", upload.single('image'), (req, res, next) => {
  // check if supported filetype
  if (!(req.file.mimetype in mimetype)) {
    return res.sendStatus(400)
  }

  const ext      = mimetype[req.file.mimetype]
  const filename = req.file.path
  const outfile  = req.file.path + '.' + ext

  // check width and height
  const width  = req.body.width|0
  const height = req.body.height|0

  // if we have both width and height, resize independent of original dimensions
  // else just use one
  if (width && height) {

  }
  else if (width) {
    if (width < 1 || width > 1280) {
      return res.status(403).send('Width must be between 1 and 1280.')
    }
  }
  else if (height) {
    if (height < 1 || height > 1280) {
      return res.status(403).send('Height must be between 1 and 1280.')
    }
  }
  else {
    // nothing - return an error
    return res.status(403).send('You must provide either width or height or both.')
  }

  // console.log('file:', req.file)

  sharp(req.file.path)
    .rotate()
    .resize(width || null, height || null)
    .toFile(outfile)
    .then(() => {
      res.sendFile(outfile, (err) => {
        setTimeout(() => {
          fs.unlink(filename, (err) => console.log)
        }, 5 * 1000)
        if (err) return next(err)
        console.log('Sent:', outfile)
        setTimeout(() => {
          fs.unlink(outfile, (err) => console.log)
        }, 5 * 1000)
      })
    })
    .catch(err => {
      setTimeout(() => {
        fs.unlink(filename, (err) => console.log)
      }, 5 * 1000)
    })
  ;
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke! ' + err)
})


//----------------------------------------------------
// server
const port = 8000
const server = http.createServer()
server.on('request', app)
server.listen(port, () => {
  console.log('Your app is listening on port ' + port)
})