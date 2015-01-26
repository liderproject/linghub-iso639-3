var fs = require('fs')
var parse = require('csv-parse')

// found here: https://gist.github.com/doorhammer/9957864
var similarity = require('./similarity.js')

var SIL_INDEX = {};

// let's read the official SIL data
// and build an index of it in memory
// so we can search against it
fs.readFile('iso-639-3_Code_Tables_20150112/iso-639-3_20150112.tab', 'utf-8', function(err, data) {
    if(err) return console.log(err)
    parse(data, {delimiter: '\t'}, function(err, output) {
        if(err) return console.log(err)
        // each output is of this form 
        // [ 'zul', 'zul', 'zul', 'zu', 'I', 'L', 'Zulu', '' ],
        // the iso code is at 0 idx
        // the language string is at 6 idx
        for(var i in output) {
            var el = output[i]
            var id = el[0]
            var lang = el[6]
            // here we should build an index
            lang = lang.toLowerCase()

            SIL_INDEX[lang] = id

            // ids in the SIL data could spread 4 columns
            var ids = []
            for(var y=0; y<4; y++) {
                if(el[y]) ids.push(el[y])
            }

            for(var x in ids) {
                SIL_INDEX[ids[x]] = id
            }
        }
        // only here SIL_INDEX is filled
        //fs.writeFile('log.json', JSON.stringify(SIL_INDEX, null, 4))
        parseLanguageFile()
    })
})

// this is called for each row of languages.csv
function language(original, str) {
    // run levenshtein algorithm
    // against the SIL_INDEX
    // and see which distance is less
    str = str.toLowerCase();

    // iterate SIL_INDEX - should perhaps be just search (build better index)
    var obj = {
        rank: 0,
        original: original
    };
    for(var i in SIL_INDEX) {
        // get distance
        var rank = similarity.similarity(str, i);

        if(rank > obj.rank) {
            obj.rank = rank
            obj.input = str
            obj.id = SIL_INDEX[i]
            obj.match = i
        }
    }
    fs.appendFile('results.json', JSON.stringify(obj))
}
function parseLanguageFile() {
    // clear results file
    fs.writeFile('results.json', '')
    fs.readFile('language.csv', 'utf-8', function(err, data) {
        if(err) return console.log(err)
        parse(data, function(err, output) {
            if(err) return console.log(err)
            // output is array of arrays (rows)
            for(var i in output) {
                var row = output[i]
                // second column is the string
                var langs = row[1]
                // they're surrounded by double quotes
                // JSON.parse thinks it's a JSON string
                langs = JSON.parse(langs)
                // try splitting by , or ;
                langs = langs.split(',')
                for(var x in langs) {
                    var arr = langs[x].split(';') 
                    for(var y in arr) {
                        // finally trim
                        language(row[1], arr[y].trim())
                    }
                }
            }
        })
    })
}
