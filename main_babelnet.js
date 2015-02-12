var fs = require('fs')
var parse = require('csv-parse')
var request = require('request')

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
        // [ aaa  ,  Ghotuo , Ghotuo ],
        // the iso code is at 0 idx
        // the language string is at 6 idx
        for(var i in output) {
            var el = output[i]
            var id = el[0]
            var lang = el[1]
            // here we should build an index

            SIL_INDEX[lang] = id
            //SIL_INDEX[id] = lang

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

                SIL_INDEX[lang] = id

                // ids in the SIL data could spread 4 columns
                /*
                var ids = []
                for(var y=0; y<4; y++) {
                    if(el[y]) ids.push(el[y])
                }

                for(var x in ids) {
                    SIL_INDEX[ids[x]] = id
                }
                */
            }
            // only here SIL_INDEX is filled
            handleSILat(0)
            fs.writeFile('babelnet_all_senses.json', '')
        })
    })

}

// this is called when the SIL index is full of information
var doneStr = {};
function handleSILat(idx) {
    var key = Object.keys(SIL_INDEX)[idx];
    if(!key) return;

    var str = key
    //var id = SIL_INDEX[key]
    if(!doneStr[str]) {
        request('http://babelnet.ns0.it/v1/getSenses?word='+str+'&lang=EN&key=ABF-6Y6NRDquIsfmcJcdOEaQ6cYghxjt', function(err, res, body) {
            doneStr[str] = id;
            try {
                var arr = JSON.parse(body)
            } catch(e) {
                return handleSILat(idx + 1);
            }
            var ids = {}
            for(var i in arr) {
                var lemma = arr[i].lemma
                if(!lemma) continue
                if(lemma.indexOf('ISO_639') == 0) {
                    var l = lemma.split(':')
                    if(l.length > 1) {
                        var id = l[1]
                        if(ids[id]) continue;
                        ids[id] = true;

                    }
                }
            }
            // check whether this lemma contains an ISO code
            var idsLength = Object.keys(ids).length
            if(!idsLength)
                return handleSILat(idx + 1);

            // re-loop and add the isocode to each object
            var strToWrite = ''
            for(var x in arr) {
                var lemma = arr[x].lemma
                if(!lemma) continue;
                arr[x].isoCode = ids 
                strToWrite += JSON.stringify(arr[x]) + '\n'
            }
            fs.appendFile('babelnet_all_senses.json', strToWrite, function(err) {
                if(err) console.log(err)
                handleSILat(idx + 1);
            })
        })
    } else {
        handleSILat(idx + 1);
    }

}

// this is called for each row of languages.csv
// langs is array because a cell in a row can contain
// multiple languages such as "Italian,English"
// therefore langs has ['Italian', 'English']
function language(str, done) {
    // run string similarity algorithm
    // against the SIL_INDEX
    // and see which ranks the highest
    var original = str
    str = str.toLowerCase()

    // iterate SIL_INDEX - should perhaps be just search (build better index)
    var obj = {
        original: original
    };
    // for each word look in babelnet
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

    handleLangAt(langs, 0, rows, idx);

}
function handleLangAt(langs, idx, rows, rowIdx) {
    var lang = langs[idx]
    if(!lang) 
        return handleRowAt(rows, rowIdx + 1)

    language(lang, function() {
        // call recursively after it has written to results.json
        handleLangAt(langs, idx + 1, rows, rowIdx)
    })
}

function parseLanguageFile() {
    // clear results file
    fs.writeFile('babelnet_all_senses.json', '')
    fs.readFile('language.csv', 'utf-8', function(err, data) {
        if(err) return console.log(err)
        parse(data, function(err, rows) {
            if(err) return console.log(err)
            handleRowAt(rows, 0)
        })
    })
}
