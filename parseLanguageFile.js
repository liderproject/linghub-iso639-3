var fs = require('fs'),
    readline = require('readline');
var parse = require('csv-parse');

parseLanguageFile()

// this is called for each row of languages.csv
// langs is array because a cell in a row can contain
// multiple languages such as "Italian,English"
// therefore langs has ['Italian', 'English']
var count = 0;
var languagesDone = {};
function language(str, done) {
    str = str.toLowerCase().trim()
    if(languagesDone[str])
        return done();
    languagesDone[str] = true
    count++;
    console.log(count);
    done()
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
    fs.readFile('language.csv', 'utf-8', function(err, data) {
        if(err) return console.log(err)
        parse(data, function(err, rows) {
            if(err) return console.log(err)
            handleRowAt(rows, 0)
        })
    })
}
