module.exports = function (app, options) {

	const ALL_CANDIDATES = [
		'alckmin',
		'bolsonaro',
		'boulos',
		'ciro',
		'doria',
		'huck',
		'lula',
		'manuela',
		'marina',
	]

	app.get('/:candidateId/search', (req, res, next) => {

		let searchTextQuery = req.query.q
		let candidateId = req.params.candidateId

		if (!searchTextQuery) {
			throw new Error('q is a required param')
		}

		app.controllers.content.searchByCandidate(candidateId, searchTextQuery)
		.then(results => {
			res.json(results)
		})
		.catch(next)
	})

	app.get('/_all/report', (req, res, next) => {
		let searchTextQuery = req.query.q

		if (!searchTextQuery) {
			throw new Error('q is a required param')
		}

		Promise.all(ALL_CANDIDATES.map(candidateId => {
			return app.controllers.content.reportCandidate(candidateId, searchTextQuery)
		}))
		.then((results) => {
			res.json(results)
		})
		.catch(next)



	})

	app.get('/:candidateId/report', (req, res, next) => {

		let searchTextQuery = req.query.q
		let candidateId = req.params.candidateId

		if (!searchTextQuery) {
			throw new Error('q is a required param')
		}

		return app.controllers.content.reportCandidate(candidateId, searchTextQuery).then(results => {
			res.json(results)
		})
		.catch(next)

	})

}
