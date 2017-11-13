// native dependencies
const http = require('http')

// internal dependencies
const pkg = require('../package.json')

// internal dependencies
const createLentePoliticaAPI = require('../')

var options = {
  port: process.env.PORT,
  apiVersion: pkg.version,
  elasticsearchURI: process.env.ELASTICSEARCH_URI,
}

// instantiate the app
var app = createLentePoliticaAPI(options)

app.ready.then(() => {
	// create http server and pass express app as callback
	var server = http.createServer(app)

	// start listening
	server.listen(options.port, function () {
	  console.log('lente-politica-api listening at port %s', options.port)
	})
})
.catch((err) => {
  console.warn(err.stack)
  console.warn('application setup error', err)
})