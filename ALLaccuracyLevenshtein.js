var fs = require('fs');


var correct = {}
var data = fs.readFileSync('correctAnnotation.json', 'utf-8')
data = data.split('\n')
for(var i=0; i<data.length; i++) {
    var line = data[i]
    try {
        var obj = JSON.parse(line)
    } catch(e) {
        continue;
    }
    obj.original = obj.original.trim().toLowerCase()
    if(!obj.id)
        continue;
    correct[obj.original] = obj.id
}

var predictions = {}
var data = fs.readFileSync('levenshtein_predictions.json', 'utf-8')
data = data.split('\n')
for(var i=0; i<data.length; i++) {
    var line = data[i]
    try {
        var obj = JSON.parse(line)
    } catch(e) {
        continue;
    }
    obj.original = obj.original.trim().toLowerCase()
    if(!obj.id)
        obj.id = ''
    // group by original
    if(predictions[obj.original]) { // check rank
        if(obj.rank > predictions[obj.original].rank) {
            // if current rank smaller than the one saved, continue
            continue;
        }
    }
    predictions[obj.original] = {
        id: obj.id,
        rank: obj.rank
    }
}
var babelnet_predictions = {}
var data = fs.readFileSync('babelnet_all_predictions_dice.json', 'utf-8')
data = data.split('\n')
for(var i=0; i<data.length; i++) {
    var line = data[i]
    try {
        var obj = JSON.parse(line)
    } catch(e) {
        continue;
    }
    // group by original
    obj.original = obj.original.trim().toLowerCase()
    if(!babelnet_predictions[obj.original])
        babelnet_predictions[obj.original] = {}

    babelnet_predictions[obj.original].rank = obj.rank
    babelnet_predictions[obj.original].isoCodes = []
    for(var x in obj.lemma.isoCode) {
        babelnet_predictions[obj.original].isoCodes.push(x)
    }
}

// find how many matches we have
var matches = []
var notMatched = []
for(var prop in correct) {
    if(predictions[prop]) { // matched SIL
        // match object now let's check if ISO code is found
        var id = correct[prop]
        if(predictions[prop].id == id) {
            // match!
            matches.push(predictions[prop].rank)
        } else {
            // if id is different try babelnet
            if(babelnet_predictions[prop]) { // matched bablenet
                // match object now let's check if ISO code is found
                var id = correct[prop]
                if(babelnet_predictions[prop].isoCodes.indexOf(id) != -1) {
                    // match!
                    matches.push(babelnet_predictions[prop].rank)
                } else {
                    notMatched.push(prop)
                }
            } else {
                notMatched.push(prop)
            }
        }
    } else { // if it's not matched SIL, match babelnet
        if(babelnet_predictions[prop]) { // matched bablenet
            // match object now let's check if ISO code is found
            var id = correct[prop]
            if(babelnet_predictions[prop].isoCodes.indexOf(id) != -1) {
                // match!
                matches.push(babelnet_predictions[prop].rank)
            } else {
                notMatched.push(prop)
            }
        } else {
            notMatched.push(prop)
        }
    }
}
var correctLength = Object.keys(correct).length
console.log('Correct set length: ' + correctLength)
console.log('Matches: ' +matches.length);
console.log('Accuracy: %' + (matches.length/correctLength) * 100)
var sum = 0;
for( var i = 0; i < matches.length; i++ ){
    sum += parseFloat( matches[i], 10 ); //don't forget to add the base
}
console.log('Average correct rank: ' + (sum/matches.length))
console.log('Smallest correct rank: ' + Math.min.apply(null, matches));
console.log('Note matched: ' + notMatched)
