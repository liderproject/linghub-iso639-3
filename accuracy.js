var fs = require('fs')

var data = fs.readFileSync('correctResults.json', 'utf-8')
var arr = JSON.parse(data)
var SIL_dice = []
var SIL_levenshtein = []
var BN_dice = []
var BN_levenshtein = []
for(var i=0; i<arr.length; i++) {
    var obj = arr[i]

    console.log('')
    console.log('')
    console.log('=================')
    console.log('Input: '+obj.input+', Expected: '+obj.expected)
    console.log('Got (SIL dice): '+obj.got_SIL_dice.iso+', Label: '+obj.got_SIL_dice.label+', Rank: '+ obj.got_SIL_dice.rank)
    if(obj.got_SIL_dice.iso.toLowerCase().trim().match(obj.expected)) {
        SIL_dice.push(obj.got_SIL_dice.rank)
        console.log('matched')
    } else {
        console.log('ERROR: not matched')
    }

    console.log('Got (SIL levenshtein): '+obj.got_SIL_levenshtein.iso+', Label: '+obj.got_SIL_levenshtein.label+', Rank: '+ obj.got_SIL_levenshtein.rank)
    if(obj.got_SIL_levenshtein.iso.toLowerCase().trim().match(obj.expected)) {
        SIL_levenshtein.push(obj.got_SIL_levenshtein.rank)
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
        BN_dice.push(obj.got_BN_dice.rank)
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
        BN_levenshtein.push(obj.got_BN_levenshtein.rank)
        console.log('matched')
    } else {
        console.log('ERROR: not matched')
    }

}
console.log('Correct set length: ' + arr.length)
console.log('Matches SIL dice: ' +SIL_dice.length);
console.log('Matches SIL levenshtein: ' +SIL_levenshtein.length);
console.log('Matches BN dice: ' +BN_dice.length);
console.log('Matches BN levenshtein: ' +BN_levenshtein.length);
