var fs = require('fs')
var readline = require('readline')
var request = require('request')
var parse = require('csv-parse')

// found here: https://gist.github.com/doorhammer/9957864
var similarity = require('./similarity.js')
var levenshteinenator = require('./levenshtein.js')

var SIL = {}
SIL.index = {}

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

            SIL.index[lang] = id

            // ids in the SIL data could spread 4 columns
            var ids = []
            for(var y=0; y<4; y++) {
                if(el[y]) ids.push(el[y])
            }

            for(var x in ids) {
                SIL.index[ids[x]] = id
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

                SIL.index[lang] = id

                // ids in the SIL data could spread 4 columns
                var ids = []
                for(var y=0; y<4; y++) {
                    if(el[y]) ids.push(el[y])
                }

                for(var x in ids) {
                    SIL.index[ids[x]] = id
                }
            }
            // only here SIL_INDEX is filled
            // now let's create the babelnet index
            createBabelNetIndex()
        })
    })

}
function createBabelNetIndex() {
    var rd = readline.createInterface({
        input: fs.createReadStream('babelnetIsoCodes.json'),
        output: process.stdout,
        terminal: false
    });
    rd.on('line', function(line) {
        // here's contents of a line
        // {"lemma":"Anglo Saxon language","isoCodes":["ISO_639:ang"]}
        try {
            var obj = JSON.parse(line)
        } catch(e) {
            return;
        }
        BN.index.push(obj);
    });
    rd.on('close', function(line) {
        // DONE
        main()
    })
}

// gets highest rankd
SIL.dice = function(input) {
    var highest = {
        rank: 0,
        iso: ''
    }
    for(var i in SIL.index) {
        var rank = similarity.similarity(input, i);
        if(rank > highest.rank) {
            highest.rank = rank
            highest.iso = SIL.index[i]
            highest.label = i
        }
    }
    return highest;
}
SIL.levenshtein = function(input) {
    var highest = {
        rank: 10000,
        iso: ''
    }
    for(var i in SIL.index) {
        var distArray = levenshteinenator.levenshteinenator(input, i);
        var rank = distArray[ distArray.length - 1 ][ distArray[ distArray.length - 1 ].length - 1 ];
        if(rank < highest.rank) {
            highest.rank = rank
            highest.iso = SIL.index[i]
            highest.label = i
        }
    }
    return highest;
}

var BN = {}
BN.index = []

BN.dice = function(input) {
    var highest = {
        rank: 0,
        iso: ''
    }
    for(var i=0; i<BN.index.length; i++) {
        var obj = BN.index[i];

        // let's put both lowercase and trim
        var lemma = obj.lemma;

        var rank = similarity.similarity(input, lemma);

        if(rank > highest.rank) {
            highest.rank = rank
            highest.iso = obj.isoCodes
            highest.label = lemma
        }
    }
    return highest;
}
BN.levenshtein = function(input) {
    var highest = {
        rank: 10000,
        iso: ''
    }
    for(var i=0; i<BN.index.length; i++) {
        var obj = BN.index[i];

        // let's put both lowercase and trim
        var lemma = obj.lemma;

        var distArray = levenshteinenator.levenshteinenator(input, lemma);
        var rank = distArray[ distArray.length - 1 ][ distArray[ distArray.length - 1 ].length - 1 ];
        if(rank < highest.rank) {
            highest.rank = rank
            highest.iso = obj.isoCodes
            highest.label = lemma
        }
    }
    return highest;
}




function main() {


    var results = []

    var data = fs.readFileSync('correctAnnotation.json', 'utf-8')
    data = data.split('\n')

    // now for each correct entry, test SIL and BabelNet directly
    var results = []
    for(var i=0; i<data.length; i++) {
        var line = data[i]
        try {
            var obj = JSON.parse(line)
        } catch(e) {
            continue;
        }
        var input = obj.original
        var expected = obj.id

        var o = {
            input: obj.original,
            expected: obj.id,

            got_SIL_dice: SIL.dice(input),
            got_SIL_levenshtein: SIL.levenshtein(input),
            got_BN_dice: BN.dice(input),
            got_BN_levenshtein: BN.levenshtein(input)
        }
        results.push(o)
    }
    fs.writeFileSync('correctResults.json', JSON.stringify(results, null, 2))

}
