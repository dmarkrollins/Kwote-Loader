const MongoClient = require('mongodb').MongoClient;
const { CategoryReader } = require('./categoryReader')
const { ProjectReader } = require('./projectReader')
const { QuoteReader } = require('./quoteReader')
const { MigrateData } = require('./migrateData')

require('dotenv').config()

const dbName = 'kwote';

const reader = new CategoryReader()
const preader = new ProjectReader()
const qreader = new QuoteReader()

let categories = []
let projects = []
let kwotes = []

let client

reader.read('./data/Categories.xml')
.then((c) => {
    console.log('Categories read', c.length)
    categories = Object.assign([], c)
    return preader.read('./data/Projects.xml')
})
.then((p) => {
    console.log('Projects read', p.length)
    projects = Object.assign([], p)
    return qreader.read('./data/Quotes.xml')
})
.then((k) => {
    console.log('Quotes read', k.length)
    kwotes = Object.assign([], k)
    return MongoClient.connect(process.env.MONGO_URL, { forceServerObjectId: false })
})
.then((mclient) =>{
    client = mclient
    console.log("Connected successfully to server");
    return client.db(dbName);
})
.then((db) => {
    console.log('Performing migration...')
    const migrator = new MigrateData({ db, categories, projects, kwotes })
    return migrator.doMigration()
})
.then(() => {
    client.close()
    console.log("All done!")
})
.catch((err) => {
    client.close()
    console.log(err)
})
