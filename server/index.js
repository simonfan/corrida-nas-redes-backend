const path = require('path')

const express = require('express')
const cors = require('cors')

function createLentePoliticaAPI(options) {
  if (!options.elasticsearchURI) {
    throw new Error('elasticsearchURI is required')
  }

  // create express app instance
  var app = express()

  // make constants available throughout the application
  app.constants = require('../shared/constants')

  // make the error constructors available throughout the application
  app.errors = require('../shared/errors')

  app.set('json spaces', 4)

  // setup services
  app.ready = require('./services')(app, options).then(() => {

  	// instantiate controllers
  	app.controllers = {}
  	app.controllers.content = require('./controllers/content')(app, options)

  	app.middleware = {}

    // cors
    app.use(cors())
    app.options('**/*', cors())


    /**
     * The heartbeat route may be used for checking whether the service
     * is running or not.
     */
    app.get('/heartbeat', function (req, res) {
      res.json({
        name: 'lente-politica',
        respondedAt: new Date(),
      })
    })


    // load routes
    require('./routes/content')(app, options)
    require('./routes/search')(app, options)

    // static
    app.use('/static', express.static(path.join(__dirname, '../static')))

    // load error-handlers
    require('./error-handlers')(app, options)
    
  })

  return app
}

module.exports = createLentePoliticaAPI
