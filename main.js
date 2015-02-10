var fs = require('fs')
var parse = require('csv-parse')

// found here: https://gist.github.com/doorhammer/9957864
var similarity = require('./similarity.js')
var levenshteinenator = require('./levenshtein.js')

var SIL_INDEX = {};
var LOW_RANKED = [];

// let's read the official SIL data
// and build an index of it in memory
// so we can search against it
fs.readFile('iso-639-3_Code_Tables_20150112/iso-639-3_Name_Index_20150112.tab', 'utf-8', function(err, data) {
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
            var lang = el[1]
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
        // fill the index with the other SIL file
        otherSILfile()
    })
})
function otherSILfile() {
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
            parseLanguageFile()
        })
    })

}

// this is called for each row of languages.csv
// langs is array because a cell in a row can contain
// multiple languages such as "Italian,English"
// therefore langs has ['Italian', 'English']
function language(langs, done) {
    var strToWrite = ''
    for(var y=0; y<langs.length; y++) {
        // run string similarity algorithm
        // against the SIL_INDEX
        // and see which ranks the highest
        var str = langs[y].trim()
        var original = str
        str = str.toLowerCase()

        // iterate SIL_INDEX - should perhaps be just search (build better index)
        var obj = {
            rank: 0,
            original: original
        };
        if(original === "LI") {
            obj.rank = 1
            obj.id = "und"
            obj.match = "LI"
        } else if(original === "greek") {
            obj.rank = 1
            obj.id = "ell"
            obj.match = "greek"
        } else if(original == "Castilian") {
            obj.rank = 1
            obj.id = "spa"
            obj.match = "spanish"
        } else if(original == "flemish") {
            obj.rank = 1
            obj.id = "nld-BE"
            obj.match = "flemish"
        }
        // for each word look at the SIL index
        for(var i in SIL_INDEX) {
            var rank = similarity.similarity(str, i);
            //var rank = levenshteinenator.levenshteinenator(str, i);

            if(rank > obj.rank) {
                obj.rank = rank
                obj.id = SIL_INDEX[i]
                obj.match = i
            }
        }
        strToWrite += JSON.stringify(obj) + '\n'
    }
    fs.appendFile('results.json', strToWrite, function(err) {
        if(err) console.log(err)
        done()
    })
}

function handleSplitContent(rows, idx) {
    var row = rows[idx];
    if(!row) return; // finished recursion
    var langs = row[1]
    langs = JSON.parse(langs)
    langs = langs.split(/[,;]+/)
    language(langs, function() {
        // call recursively after it has written to results.json
        handleSplitContent(rows, idx + 1)
    })
}

function handleRowAt(rows, idx) {
    // rows is array of arrays (rows)
    var row = rows[idx];
    if(!row) { // finished recursion
        // start handling the content by splitting it 
        // (could be the ones with commas and ;)
        //handleSplitContent(rows, 0)
        return;
    }
    // second column is the string
    var langs = row[1]
    // they're surrounded by double quotes
    // JSON.parse thinks it's a JSON string
    langs = JSON.parse(langs)
    // XXX splitting by , or ; is ok in many occasion
    // but also not ok in others. best would be to run ranking
    // and rerun it on split only for the low ranked
    //langs = [langs]
    langs = langs.split(/[,;]+/)
    

    language(langs, function() {
        // call recursively after it has written to results.json
        handleRowAt(rows, idx + 1)
    })
}

function parseLanguageFile() {
    // clear results file
    fs.writeFile('results.json', '')
    fs.readFile('language.csv', 'utf-8', function(err, data) {
        if(err) return console.log(err)
        parse(data, function(err, rows) {
            if(err) return console.log(err)
            handleRowAt(rows, 0)
        })
    })
}
