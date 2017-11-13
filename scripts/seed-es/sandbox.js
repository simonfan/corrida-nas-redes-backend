const path = require('path')
const fs = require('fs')

const slug = require('slug')

const csvParse = require('csv-parse/lib/sync')

const SOURCE_CSV_CONTENTS = fs.readFileSync(path.join(__dirname, 'test-data/elpasbrasil-facebook-feed.csv'), 'utf8')


let records = csvParse(SOURCE_CSV_CONTENTS, {
	columns: true,
})
console.log(Object.keys(records[0]).map(key => {
	key = key.toLowerCase()
	return slug(key, {
		lowercase: true
	})
}))

