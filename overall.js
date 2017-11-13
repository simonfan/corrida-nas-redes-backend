const DATA = require('./overall.json')

const OVERALL = DATA.reduce((all, candidate) => {

	all.totalCount += candidate.totalCount
	// all.candidateLikes += candidate.candidateLikes

	return all

}, {
	totalCount: 0,
	// candidateLikes: 0,
})

// console.log(OVERALL)


let d = DATA.map(candidate => {
	let c = {}
	c.name = candidate.candidateId
	c.count = candidate.totalCount
	c.percentage = ((candidate.totalCount / OVERALL.totalCount) * 100).toFixed(2)

	return c
})

console.log(d)
console.log(OVERALL)