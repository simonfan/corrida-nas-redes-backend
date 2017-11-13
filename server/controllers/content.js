function _sumProperty(hits, prop) {
  return hits.reduce((res, hit) => {
    let parsedValue = parseFloat(hit._source[prop])

    return parsedValue ? res + parsedValue : res
  }, 0)
}

module.exports = function (app, options) {
	let contentCtrl = {}

	contentCtrl.create = (content) => {

    return app.services.elasticsearch.index({
      index: app.constants.ES_DOCUMENTS_INDEX_NAME,
      type: app.constants.ES_DOCUMENTS_BASE_TYPE,
      id: content.id,
      body: content,
    })
    .then(() => {
      console.log('document indexed ' + this._id + ' successfully indexed')
    })
    .catch((err) => {
      console.warn('error indexing document ' + this._id, err)

      throw err
    })

	}

	contentCtrl.delete = (contentId) => {
    return app.services.elasticsearch.delete({
      index: app.constants.ES_DOCUMENTS_INDEX_NAME,
      type: app.constants.ES_DOCUMENTS_BASE_TYPE,
      id: contentId,
    })
	}

	contentCtrl.search = (query) => {
    return app.services.elasticsearch.search({
      index: app.constants.ES_DOCUMENTS_INDEX_NAME,
      body: {
        query: query,
      }
    })
	}

  contentCtrl.searchByCandidate = (candidateId, searchTextQuery) => {
    let body = {
      // TODO: use proper aggregation
      size: 10000,
      query: {
        filtered: {
          filter: {
            term: {
              candidateId: candidateId
            }
          }
        }
      }
    }

    if (searchTextQuery) {
      body.query.filtered.query = {
        match: {
          message: searchTextQuery,
        }
      }
    }

    return app.services.elasticsearch.search({
      index: app.constants.ES_DOCUMENTS_INDEX_NAME,
      body: body,
    })
  }

  contentCtrl.countCandidateContents = (candidateId, searchTextQuery) => {

    let body = {
      query: {
        filtered: {
          filter: {
            term: {
              candidateId: candidateId
            }
          }
        }
      }
    }

    if (searchTextQuery) {
      body.query.filtered.query = {
        match: {
          message: searchTextQuery,
        }
      }
    }

    return app.services.elasticsearch.count({
      index: app.constants.ES_DOCUMENTS_INDEX_NAME,
      body: body
    })
    .then(results => {
      return results.count
    })

    // return app.services.elasticsearch.count({
    //   index: app.constants.ES_DOCUMENTS_INDEX_NAME,
    //   body: {
    //     query: {
    //       filtered: {
    //         filter: {
    //           term: {
    //             candidateId: candidateId
    //           }
    //         }
    //       }
    //     }
    //   }
    // })
    // .then(results => {
    //   return results.count
    // })
  }

  // contentCtrl.computeCandidateScore = (candidateId, searchTextQuery) => {
  //   return 
  // }

  contentCtrl.reportCandidate = (candidateId, searchTextQuery) => {
    return Promise.all([
      app.controllers.content.countCandidateContents(candidateId, searchTextQuery),
      app.controllers.content.countCandidateContents(candidateId),


      app.controllers.content.searchByCandidate(candidateId, searchTextQuery),
      app.controllers.content.searchByCandidate(candidateId),
    ])
    .then(results => {

      // console.log(JSON.stringify(results[2], null, '  '))
      console.log(JSON.stringify(results[3], null, '  '))


      let termSearchResults = results[2]
      let candidateSearchResults = results[3]


      let report = {
        candidateId: candidateId,
        searchTextQuery: searchTextQuery,
        termCount: results[0],
        totalCount: results[1],

        termLikes: _sumProperty(termSearchResults.hits.hits, 'likes'),
        candidateLikes: _sumProperty(candidateSearchResults.hits.hits, 'likes'),

        termScoreSum: _sumProperty(termSearchResults.hits.hits, 'score'),
        candidateScoreSum: _sumProperty(candidateSearchResults.hits.hits, 'score')
        // candidateScoreSum: candidateSearchResults.hits.hits.reduce((score, hit) => {
        //   let parsedScore = parseFloat(hit._source.score)

        //   // console.log(hit)

        //   return parsedScore ? score + parsedScore : score
        // }, 0)
      }

      report.weightLikes = report.termLikes / report.candidateLikes

      return report
    })
  }

  // contentCtrl.listCandidateContents = (candidateId) => {

  //   return app.services.elasticsearch.search({
  //     index: app.constants.ES_DOCUMENTS_INDEX_NAME,
  //     body: {
  //       query: {
  //         filtered: {
  //           filter: {
  //             term: {
  //               candidateId: candidateId
  //             }
  //           }
  //         }
  //       }
  //     }
  //   })
  // }

  // contentCtrl.count = (query) => {
  //   return app.services.elasticsearch.count({
  //     index: app.constants.ES_DOCUMENTS_INDEX_NAME,
  //     body: {
  //       query: query
  //     }
  //   })
  // }

	return contentCtrl
}
