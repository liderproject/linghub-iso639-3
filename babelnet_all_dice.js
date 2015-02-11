var fs = require('fs'),
    readline = require('readline');
var parse = require('csv-parse');

// found here: https://gist.github.com/doorhammer/9957864
var similarity = require('./similarity.js')
var levenshteinenator = require('./levenshtein.js')

fs.writeFile('babelnet_all_predictions_dice.json', '')
parseLanguageFile()

// this is called for each row of languages.csv
// langs is array because a cell in a row can contain
// multiple languages such as "Italian,English"
// therefore langs has ['Italian', 'English']
var languagesDone = {};
function language(str, done) {
    // run string similarity algorithm
    // against the SIL_INDEX
    // and see which ranks the highest
    var original = str
    str = str.toLowerCase().trim()
    if(languagesDone[str])
        return done();
    languagesDone[str] = true;


    var rd = readline.createInterface({
        input: fs.createReadStream('babelnet_all_senses.json'),
        output: process.stdout,
        terminal: false
    });

    var highest = {
        rank: 0,
        original: '',
        lemma: {}
    };

    rd.on('line', function(line) {
        // here's contents of a line
        // {"lemma":"Zuojiang_Zhuang","simpleLemma":"Zuojiang_Zhuang","source":"WIKIDATA","sensekey":"Q13848149#1","position":1,"language":"EN","pos":"NOUN","synsetID":{"id":"bn:02136113n"},"translationInfo":"","pronunciations":{"audios":[],"transcriptions":[]},"isoCode":{}}
        // run dice coefficient algorithm against .lemma
        var obj = JSON.parse(line)
        // let's put both lowercase and trim
        var lemma = obj.lemma.trim().toLowerCase();

        var rank = similarity.similarity(str, lemma);

        if(rank > highest.rank) {
            highest.rank = rank
            highest.original = original
            highest.lemma = obj
        }
    });
    rd.on('close', function(line) {
        fs.appendFile('babelnet_all_predictions_dice.json', JSON.stringify(highest) + '\n', function(err) {
            if(err) console.log(err)
            done()
        })
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
