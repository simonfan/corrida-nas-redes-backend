module.exports = function (app, options) {

  app.services = {}

  return Promise.all([
    require('./elasticsearch')(app, options)
  ])
  .then((results) => {

    console.log('elasticsearch ready')

    app.services.elasticsearch = results[0]
  })
}
