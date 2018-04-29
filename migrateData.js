const { _ } = require('underscore')
const Random = require('meteor-random');

const CATEGORIES = 'categories'
const PROJECTS = 'projects'
const KWOTES = 'quotes'
const TEST_MODE = true

function convertToRtf(plain) {
    plain = plain.replace(/\n/g, "\\par\n");
    return "{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang2057{\\fonttbl{\\f0\\fnil\\fcharset0 Microsoft Sans Serif;}}\n\\viewkind4\\uc1\\pard\\f0\\fs17 " + plain + "\\par\n}";
}

// function convertToPlain(rtf) {
//     rtf = rtf.replace(/\\par[d]?/g, "");
//     return rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "").trim();
// }
function convertToPlain(rtf) {
    rtf = rtf.replace(/\\par[d]?/g, "");
    rtf = rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "")
    return rtf.replace(/\\'[0-9a-zA-Z]{2}/g, "").trim();
}

function streamToString (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunks.push)
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}
  

class MigrateData {

    constructor({ db, categories, projects, kwotes }) {
        this.db = db
        this.categories = categories
        this.projects = projects
        this.kwotes = kwotes
        this.catList = []
        this.projList = []
        this.userId = process.env.USER_ID
    }

    async doMigration() {
        await this.addCategories()
        await this.addProjects()
        await this.addKwotes()
        await this.xrefCategories()
        await this.xrefProjects()
    }

    async addCategories() {

        const catList = _.uniq(_.pluck(this.categories, 'name'))

        const collections = await this.db.collections();
        if (!collections.map(c => c.s.name).includes(CATEGORIES)) {
            await this.db.createCollection(CATEGORIES);
        }

        const categoriesdb = await this.db.collection(CATEGORIES)

        if (TEST_MODE) {
            await categoriesdb.remove({ createdBy: process.env.USER_ID})
        }
        
        for(let i = 0; i < catList.length; i += 1){
            const doc = {
                title: catList[i],
                createdBy: this.userId,
                _id: Random.id()
            }
            await categoriesdb.insert(doc)
            process.stdout.write(`Processing categories ${i}\r`);
        }
        console.log('Done processing categories')
    }

    async addProjects() {

        let i = 0

        const projList = _.uniq(_.pluck(this.projects, 'name'))

        const collections = await this.db.collections();
        if (!collections.map(c => c.s.name).includes(PROJECTS)) {
            await this.db.createCollection(PROJECTS);
        }

        const projectsdb = await this.db.collection(PROJECTS)

        if (TEST_MODE) {
            await projectsdb.remove({ createdBy: process.env.USER_ID})
        }
     
        for(i = 0; i < projList.length; i += 1) {
            const doc = {
                title: projList[i],
                createdBy: this.userId,
                _id: Random.id()
            }
            await projectsdb.insert(doc)
            process.stdout.write(`Processing projects ${i}\r`);
        }

        console.log('Done processing projects')

    }

    async addKwotes() {

        let i = 0
        
        const collections = await this.db.collections();
        if (!collections.map(c => c.s.name).includes(KWOTES)) {
            await this.db.createCollection(KWOTES);
        }

        const quotes = await this.db.collection(KWOTES)

        if (TEST_MODE) {
            await quotes.remove({ createdBy: process.env.USER_ID})
        }

        for(i = 0; i < this.kwotes.length; i += 1) {

            const doc = {
                title: this.kwotes[i].title,
                body: convertToPlain(this.kwotes[i].body),
                createdBy: this.userId,
                createdAt: new Date(),
                _id: Random.id(),
                categories: [],
                projects: []
            }
            await quotes.insert(doc)
            _.extend(this.kwotes[i], { kwoteId: doc._id });
            process.stdout.write(`Processing quotes ${i} of ${this.kwotes.length}\r`);
        }

        console.log('Done processing kwotes')

    }

    async xrefCategories(){

        const quotes = await this.db.collection(KWOTES)
        const categoriesdb = await this.db.collection(CATEGORIES)

        for(let j = 0; j < this.kwotes.length; j += 1){

            const quote = await quotes.findOne({ _id: this.kwotes[j].kwoteId })

            if(quote) {

                const catlist = _.where(this.categories, { quoteId: this.kwotes[j].quoteId })

                const catids = []

                for(let i = 0; i < catlist.length; i += 1) {
                    const category = await categoriesdb.findOne({ title: catlist[i].name })
                    catids.push(category._id)
                }

                if (catids.length > 0){
                    await quotes.update(
                        { 
                            _id: quote._id
                        }, 
                        {
                            $set: {
                                categories: catids
                            }
                        } 
                    )
                }
            }
            process.stdout.write(`Linking categories ${j} of ${this.kwotes.length} \r`);
        }

        console.log('Done linking categories')
    }

    async xrefProjects() {
        const quotes = await this.db.collection(KWOTES)
        const projectsdb = await this.db.collection(PROJECTS)

        for(let j = 0; j < this.kwotes.length; j += 1){

            const quote = await quotes.findOne({ _id: this.kwotes[j].kwoteId })

            if(quote) {

                const projlist = _.where(this.projects, { quoteId: this.kwotes[j].quoteId })

                const projids = []

                for(let i = 0; i < projlist.length; i += 1) {
                    const project = await projectsdb.findOne({ title: projlist[i].name })
                    projids.push(project._id)
                }

                if (projids.length > 0){
                    await quotes.update(
                        { 
                            _id: quote._id
                        }, 
                        {
                            $set: {
                                projects: projids
                            }
                        } 
                    )
                }
            }
            process.stdout.write(`Linking projects ${j} of ${this.kwotes.length} \r`);
        }

        console.log('Done linking projects')
    }

}

module.exports = { MigrateData }
