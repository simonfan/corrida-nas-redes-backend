const gulp = require('gulp')
const nodemon = require('gulp-nodemon')

const elasticsearch = require('elasticsearch')

const DEV_ES_URI       = 'http://127.0.0.1:9200'
const TEST_AUTH_SECRET = 'TEST_AUTH_SECRET'

gulp.task('nodemon', () => {
	nodemon({
    script: 'cli/start.js',
    env: {
      PORT: 4000,
      NODE_ENV: 'development',
      ELASTICSEARCH_URI: DEV_ES_URI,
    },
    ext: 'js',
    ignore: [
      'gulpfile.js',
    ],
  })

})

gulp.task('drop-es', function (done) {
  var client = new elasticsearch.Client({
    host: DEV_ES_URI,
    log: 'trace'
  })

  client.indices.delete({
    index: '_all'
  })
  .then(() => {
    done()
  })
})

gulp.task('seed-es', () => {
  nodemon({
    script: 'scripts/seed-es/index.js',
    env: {
      PORT: 4000,
      NODE_ENV: 'development',
      ELASTICSEARCH_URI: DEV_ES_URI,
    },
    ext: 'js',
    ignore: [
      'gulpfile.js',
    ],
  })
})
