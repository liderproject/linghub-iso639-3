var fs = require('fs')

var data = fs.readFileSync('correctResults.json', 'utf-8')
var arr = JSON.parse(data)
var dice = []
var levenshtein = []

for(var i=0; i<arr.length; i++) {
    var obj = arr[i]

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
        dice.push(rank)
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
        levenshtein.push(rank)
        console.log('matched')
    } else {
        console.log('ERROR: not matched')
    }


}
console.log('Correct set length: ' + arr.length)
console.log('Matches SIL+BN dice: ' +dice.length);
var sum = 0;
for( var i = 0; i < dice.length; i++ ){
        sum += parseFloat(dice[i], 10 ); //don't forget to add the base
}
console.log('Average correct rank: ' + (sum/dice.length))
console.log('Smallest correct rank: ' + Math.min.apply(null, dice));
console.log('')
console.log('Matches SIL+BN levenshtein: ' +levenshtein.length);
var sum = 0;
for( var i = 0; i < levenshtein.length; i++ ){
        sum += parseFloat(levenshtein[i], 10 ); //don't forget to add the base
}
console.log('Average correct rank: ' + (sum/levenshtein.length))
console.log('Smallest correct rank: ' + Math.min.apply(null, levenshtein));
