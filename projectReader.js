/* eslint-disable */

const XmlReader = require('xml-reader');
const fs = require('fs')

class ProjectReader {

    read(path) {

        return new Promise((resolve, reject) => {      

            const array = []
            
            const reader = XmlReader.create();
            
            const xml = fs.readFileSync(path, 'utf8') 
            
            try {
                reader.on('tag:Project', (data) => {
                    const item = {}
                    item.quoteId = data.children[1].children[0].value
                    item.name = data.children[0].children[0].value
                    array.push(item)
                });
                
                reader.on('done', () => {{
                    resolve(array)
                }})
                
                reader.parse(xml);
            }
            catch(error) {
                reject(error)
            }
        })
    }
}

module.exports = { ProjectReader }
