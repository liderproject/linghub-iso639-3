var fs = require('fs')
var parse = require('csv-parse')


var data = fs.readFileSync('language.csv', 'utf-8')
var languages = {};
parse(data, function(err, rows) {
    if(err) return console.log(err)
    for(var i in rows) {
        var row = rows[i];
        var langs = row[1];
        var frequency = row[0];
        langs = JSON.parse(langs)
        langs = langs.split(/[,;]+/)
        for(var x in langs) {
            var lang = langs[x].trim()
            if(!languages[lang])
                languages[lang] = 0;
            languages[lang] = parseInt(languages[lang], 10) + parseInt(frequency, 10);
        }
    }

    done();
})

function done() {

    var data = fs.readFileSync('correctResults.json', 'utf-8')
    var arr = JSON.parse(data)
    var dice = 0
    var levenshtein = 0
    var total_frequency = 0;

    for(var i=0; i<arr.length; i++) {
        var obj = arr[i]
        var frequency = languages[obj.input]
        total_frequency += frequency;

        console.log('')
        console.log('')
        console.log('=================')
        console.log('Input: '+obj.input+', Expected: '+obj.expected)

        // get highest rank(dice)
        var isoCodes = []
        var rank = ''
        var label = ''
        if(obj.got_SIL_dice.rank > obj.got_BN_dice.rank) {
            isoCodes.push(obj.got_SIL_dice.iso)
            rank = obj.got_SIL_dice.rank
            label = obj.got_SIL_dice.label
        } else {
            isoCodes = obj.got_BN_dice.iso
            rank = obj.got_BN_dice.rank
            label = obj.got_BN_dice.label
        }
        console.log('Got (dice): '+isoCodes+', Label: '+label+', Rank: '+ rank)
        var matched = false
        for(var x=0; x<isoCodes.length; x++) {
            var isoCode = isoCodes[x] 
            if(isoCode.toLowerCase().trim().match(obj.expected)) {
                matched = true;
            }
        }
        if(matched) {
            dice = dice + frequency;
            console.log('matched')
        } else {
            console.log('ERROR: not matched')
        }

        // get lowest rank (levenshtein)
        var isoCodes = []
        var rank = ''
        if(obj.got_SIL_levenshtein.rank < obj.got_BN_levenshtein.rank) {
            isoCodes.push(obj.got_SIL_levenshtein.iso)
            rank = obj.got_SIL_levenshtein.rank
            label = obj.got_SIL_levenshtein.label
        } else {
            isoCodes = obj.got_BN_levenshtein.iso
            rank = obj.got_BN_levenshtein.rank
            label = obj.got_BN_levenshtein.label
        }
        console.log('Got (levenshtein): '+isoCodes+', Label: '+label+', Rank: '+ rank)
        var matched = false
        for(var x=0; x<isoCodes.length; x++) {
            var isoCode = isoCodes[x] 
            if(isoCode.toLowerCase().trim().match(obj.expected)) {
                matched = true;
            }
        }
        if(matched) {
            levenshtein = levenshtein + frequency;
            console.log('matched')
        } else {
            console.log('ERROR: not matched')
        }


    }
    console.log('Correct set length: ' + arr.length)
    console.log('Matches SIL+BN dice: ' +dice/total_frequency);
    console.log('')
    console.log('Matches SIL+BN levenshtein: ' +levenshtein/total_frequency);
}
