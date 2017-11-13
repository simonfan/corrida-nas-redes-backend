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

let CLOUDS = DATA_FILES.map(dataFile => {
	return {
		filename: dataFile.filename,
		words: dataFile.records.reduce((acc, record) => {
			return record.message + ' ' + acc
		}, '')
	}
})

// console.log(CLOUDS[0])

const WORDCLOUD_DATA_DIR = path.join(__dirname, 'wordclouds')

CLOUDS.forEach(cloud => {
	fs.writeFileSync(path.join(WORDCLOUD_DATA_DIR, cloud.filename), cloud.words, 'utf8')
})

