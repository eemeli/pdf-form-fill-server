const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs')
const { fields, fill } = require('pdf-form-fill')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const pdfTemplateDir = process.env.PDF_TEMPLATE_DIR || 'templates'

const onError = (res, error) => {
  if (error.code === 'ENOENT') {
    res.status(404).end()
  } else {
    res.status(500).send(error.message)
  }
}

app.get('/', (req, res) => {
  fs.readdir(pdfTemplateDir, (error, files) => {
    if (error) res.status(500).json(error)
    else res.json(files.filter(fn => /\.pdf$/i.test(fn)))
  })
})

app.get('/:template', (req, res) => {
  const { template } = req.params
  const fn =`${pdfTemplateDir}/${template}`
  fields(fn)
    .then(data => res.json(data))
    .catch(error => onError(res, error))
})

app.post('/:template', (req, res) => {
  const { template } = req.params
  const fn =`${pdfTemplateDir}/${template}`
  let { fields, info } = req.body
  if (typeof fields === 'string') fields = JSON.parse(fields)
  if (info) {
    if (typeof info === 'string') info = JSON.parse(info);
    ['CreationDate', 'ModDate'].forEach(d => {
      if (info[d]) info[d] = info[d] === 'now' ? new Date() : new Date(info[d])
    })
  }
  fill(fn, fields, { info, verbose: true })
    .then(stream => {
      res.setHeader('Content-Type', 'application/pdf')
      stream.pipe(res)
    })
    .catch(error => onError(res, error))
})

const port = Number(process.env.PORT) || 3000
app.listen(port, () => console.log('pdf-form-fill-server now listening on port', port))
