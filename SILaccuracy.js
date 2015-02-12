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
var data = fs.readFileSync('dice_coefficient_predictions.json', 'utf-8')
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
    if(obj.rank == 0)
        continue;
    // group by original
    if(predictions[obj.original]) { // check rank
        if(obj.rank < predictions[obj.original].rank) {
            // if current rank smaller than the one saved, continue
            continue;
        }
    }
    predictions[obj.original] = {
        id: obj.id,
        rank: obj.rank
    }
}

// find how many matches we have
var matches = []
var notMatched = []
for(var prop in correct) {
    if(predictions[prop]) {
        // match object now let's check if ISO code is found
        var id = correct[prop]
        if(predictions[prop].id == id) {
            // match!
            matches.push(predictions[prop].rank)
        } else {
            notMatched.push(prop)
        }
    } else {
        notMatched.push(prop)
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
