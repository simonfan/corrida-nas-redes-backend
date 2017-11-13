// third-party
const elasticsearch = require('elasticsearch')

const CONSTANTS = require('../../shared/constants')

module.exports = function (app, options) {

	const CONSTANTS = app.constants

  var client = new elasticsearch.Client({
  	apiVersion: '2.4',
    host: options.elasticsearchURI,
    log: 'trace'
  })

  /**
   * Setup indices and mappings
   */
  return client.indices.exists({
    index: CONSTANTS.ES_DOCUMENTS_INDEX_NAME
  })
  .then((exists) => {
    console.log(exists)

    if (exists) {
      console.log('index ' + CONSTANTS.ES_DOCUMENTS_INDEX_NAME + ' already exists, skipping creation')

      return
    } else {

      console.log('creating index ' + CONSTANTS.ES_DOCUMENTS_INDEX_NAME)

      var body = {}

// 'page-name',
// 'created-date',
// 'timezone',
// 'post-url',
// 'message',
// 'title',
// 'caption',
// 'description',
// 'link-url',
// 'type',
// 'score',
// 'likes',
// 'love',
// 'wow',
// 'haha',
// 'sad',
// 'angry',
// 'comments',
// 'shares',
// 'video-share-status',
// 'post-views',
// 'total-views-of-this-video',
// 'percentage-views-from-this-post',
// 'total-views-for-all-crossposts',
// 'final-link'


      body.mappings = {}
      body.mappings[CONSTANTS.ES_DOCUMENTS_BASE_TYPE] = {
        properties: {
          message: {
            type: 'string',
            analyzer: 'brazilian',
          },

          candidateId: {
            type: 'string',
          }
        }
      }

      body.settings = {
        "analysis": {
          "filter": {
            "brazilian_stop": {
              "type":       "stop",
              "stopwords":  "_brazilian_" 
            },
            // "brazilian_keywords": {
            //   "type":       "keyword_marker",
            //   "keywords":   ['s'] 
            // },
            // "brazilian_stemmer": {
            //   "type":       "stemmer",
            //   "language":   "brazilian"
            // }
          },
          "analyzer": {
            "brazilian": {
              "tokenizer":  "standard",
              "filter": [
                "lowercase",
                "brazilian_stop",
                // "brazilian_keywords",
                // "brazilian_stemmer"
              ]
            }
          }
        }
      }

      return client.indices.create({
        index: CONSTANTS.ES_DOCUMENTS_INDEX_NAME,
        type: CONSTANTS.ES_DOCUMENTS_BASE_TYPE,
        body: body
      })
    }
  })
  .then(() => {
    return client
  })
}
