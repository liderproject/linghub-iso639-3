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
var doneStr = {};
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
    if(!doneStr[str]) {
        request('http://babelnet.ns0.it/v1/getSenses?word='+str+'%20language&lang=EN&key=ABF-6Y6NRDquIsfmcJcdOEaQ6cYghxjt', function(err, res, body) {
            try {
                var arr = JSON.parse(body)
            } catch(e) {
                return done();
            }
            var ids = {}
            var strToWrite = ''
            for(var i in arr) {
                var lemma = arr[i].lemma
                if(!lemma) continue
                if(lemma.indexOf('ISO_639') == 0) {
                    var l = lemma.split(':')
                    if(l.length > 1) {
                        var id = l[1]
                        if(ids[id]) continue;
                        ids[id] = true;
                        doneStr[str] = id;

                        obj.id = id
                        obj.match = str
                        strToWrite += JSON.stringify(obj) + '\n'
                    }
                }
            }
            fs.appendFile('results.json', strToWrite, function(err) {
                if(err) console.log(err)
                done()
            })
        })
    } else {
        done();
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
    fs.writeFile('results.json', '')
    fs.readFile('language.csv', 'utf-8', function(err, data) {
        if(err) return console.log(err)
        parse(data, function(err, rows) {
            if(err) return console.log(err)
            handleRowAt(rows, 0)
        })
    })
}
