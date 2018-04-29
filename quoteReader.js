/* eslint-disable */

const XmlReader = require('xml-reader');
const fs = require('fs')
const { _ } = require('underscore')

const valueByName = (data, id) => {
    const item = _.findWhere(data.children, { name: id })
    if (item && item.children.length > 0) {
        return item.children[0].value
    }
    return ''
}

class QuoteReader {

    read(path) {

        return new Promise((resolve, reject) => {
            const array = []
            
            const reader = XmlReader.create();
            
            const xml = fs.readFileSync(path, 'utf8') 

            try {
                reader.on('tag:Quote', (data) => {
                    const item = {}
                    item.quoteId = valueByName(data, 'ID')
                    item.title = valueByName(data, 'ShortTitle')
                    item.body = valueByName(data, 'Body')
                    array.push(item)
                });
                
                reader.on('done', () => {{
                    resolve(array)
                }})
                
                reader.parse(xml);
            }
            catch (error) {
                reject(error)
            }
            
        })
    }
}

module.exports = { QuoteReader }
