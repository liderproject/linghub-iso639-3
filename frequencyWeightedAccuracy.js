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
    var SIL_dice = 0;
    var SIL_levenshtein = 0
    var BN_dice = 0
    var BN_levenshtein = 0
    var total_frequency = 0;
    for(var i=0; i<arr.length; i++) {
        var obj = arr[i]
        var frequency = languages[obj.input]
        total_frequency += frequency;

        console.log('')
        console.log('')
        console.log('=================')
        console.log('Input: '+obj.input+', Expected: '+obj.expected)
        console.log('Got (SIL dice): '+obj.got_SIL_dice.iso+', Label: '+obj.got_SIL_dice.label+', Rank: '+ obj.got_SIL_dice.rank)
        if(obj.got_SIL_dice.iso.toLowerCase().trim().match(obj.expected)) {
            SIL_dice = SIL_dice + frequency;

            console.log('matched')
        } else {
            console.log('ERROR: not matched')
        }

        console.log('Got (SIL levenshtein): '+obj.got_SIL_levenshtein.iso+', Label: '+obj.got_SIL_levenshtein.label+', Rank: '+ obj.got_SIL_levenshtein.rank)
        if(obj.got_SIL_levenshtein.iso.toLowerCase().trim().match(obj.expected)) {
            SIL_levenshtein = SIL_levenshtein + frequency;
            console.log('matched')
        } else {
            console.log('ERROR: not matched')
        }

        console.log('Got (BN dice): '+obj.got_BN_dice.iso+', Label: '+obj.got_BN_dice.label+', Rank: '+ obj.got_BN_dice.rank)
        var matched = false
        for(var x=0; x<obj.got_BN_dice.iso.length; x++) {
            var isoCode = obj.got_BN_dice.iso[x] 
            if(isoCode.toLowerCase().trim().match(obj.expected)) {
                matched = true;
            }
        }
        if(matched) {
            BN_dice = BN_dice + frequency;
            console.log('matched')
        } else {
            console.log('ERROR: not matched')
        }

        console.log('Got (BN levenshtein): '+obj.got_BN_levenshtein.iso+', Label: '+obj.got_BN_levenshtein.label+', Rank: '+ obj.got_BN_levenshtein.rank)
        var matched = false
        for(var x=0; x<obj.got_BN_levenshtein.iso.length; x++) {
            var isoCode = obj.got_BN_levenshtein.iso[x] 
            if(isoCode.toLowerCase().trim().match(obj.expected)) {
                matched = true;
            }
        }
        if(matched) {
            BN_levenshtein = BN_levenshtein + frequency;
            console.log('matched')
        } else {
            console.log('ERROR: not matched')
        }

    }
    console.log('Correct set length: ' + arr.length)

    console.log('Matches SIL dice: ' +SIL_dice/total_frequency);
    console.log('')


    console.log('Matches SIL levenshtein: ' +SIL_levenshtein/total_frequency);


    console.log('')

    console.log('Matches BN dice: ' + BN_dice/total_frequency);

    console.log('')

    console.log('Matches BN levenshtein: ' +BN_levenshtein/total_frequency);
}
