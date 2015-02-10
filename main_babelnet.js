var fs = require('fs')
var parse = require('csv-parse')
var request = require('request')

// found here: https://gist.github.com/doorhammer/9957864
var similarity = require('./similarity.js')
var levenshteinenator = require('./levenshtein.js')

var SIL_INDEX = {};
var LOW_RANKED = [];

parseLanguageFile();

// this is called for each row of languages.csv
// langs is array because a cell in a row can contain
// multiple languages such as "Italian,English"
// therefore langs has ['Italian', 'English']
var done = {};
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
            original: original
        };
        // for each word look in babelnet
        if(!done[str]) {
            request('http://babelnet.ns0.it/v1/getSenses?word='+str+'%20language&lang=EN&key=ABF-6Y6NRDquIsfmcJcdOEaQ6cYghxjt', function(err, res, body) {
                var arr = JSON.parse(body)
                var ids = {}
                for(var i in arr) {
                    var lemma = arr[i].lemma
                    if(lemma.indexOf('ISO_639') == 0) {
                        var l = lemma.split(':')
                        if(l.length > 1) {
                            var id = l[1]
                            if(ids[id]) continue;
                            ids[id] = true;
                            done[str] = id;

                            obj.id = id
                            obj.match = str

                            fs.appendFile('results.json', JSON.stringify(obj) + '\n', function(err) {
                                if(err) console.log(err)
                                //done()
                            })
                        }

                    }
                }
            })
        }
    }
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
