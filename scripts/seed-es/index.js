const fs = require('fs')
const path = require('path')

const slug = require('slug')
const csvParseSync = require('csv-parse/lib/sync')
const csvParse = require('csv-parse')

const pkg = require('../../package.json')

const createLentePoliticaAPI = require('../../')

const TEST_DATA_DIR = path.join(__dirname, 'test-data')
const DATA_DIR = path.join(__dirname, 'data')

const CSV_RE = /\.csv$/

let DATA_FILES = fs.readdirSync(DATA_DIR).filter(filename => {
	return CSV_RE.test(filename)
})
.map((filename) => {
	console.log(`parse ${filename}`)

	return {
		filename: filename,
		records: csvParseSync(fs.readFileSync(path.join(DATA_DIR, filename), 'utf8'), {
			columns: true,
			max_limit_on_data_read: Infinity,
		})
		.map((srcRec, index) => {
			let newRec = {}

			for (let key in srcRec) {
				newRec[slug(key.toLowerCase())] = srcRec[key]
			}

			// add candidateId and id
			newRec.candidateId = filename.replace(CSV_RE, '')
			newRec.id = newRec.candidateId + index

			return newRec
		}),
	}
})

// DATA_FILES.forEach(dataFile => {
// 	console.log(dataFile.filename, dataFile.records.length)
// })

var options = {
  apiVersion: pkg.version,
  elasticsearchURI: process.env.ELASTICSEARCH_URI,
}

// instantiate the app
var app = createLentePoliticaAPI(options)


app.ready.then(() => {

	// flatten records from data files
	let records = DATA_FILES.reduce((acc, dataFile) => {
		return acc.concat(dataFile.records)
	}, [])

	// create all records
	return records.reduce((lastPromise, record) => {

		return lastPromise.then(() => {
			return app.controllers.content.create(record)
		})

	}, Promise.resolve())

})
.then(() => {
	console.log('====== SEED ES FINISH ======')
})
.catch((err) => {
  console.warn(err.stack)
  console.warn('application setup error', err)
})