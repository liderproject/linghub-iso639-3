var fs = require('fs');


var correct = []
var data = fs.readFileSync('correctAnnotation.json', 'utf-8')
data = data.split('\n')
for(var i=0; i<data.length; i++) {
    var line = data[i]
    try {
        var obj = JSON.parse(line)
    } catch(e) {
        continue;
    }
    if(!obj.id)
        obj.id = ''
    correct.push({
        original: obj.original,
        id: obj.id
    })
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
    if(!obj.id)
        obj.id = ''
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

var babelnet_predictions = {}
var data = fs.readFileSync('babelnet_predictions.json', 'utf-8')
data = data.split('\n')
for(var i=0; i<data.length; i++) {
    var line = data[i]
    try {
        var obj = JSON.parse(line)
    } catch(e) {
        continue;
    }
    if(!obj.id)
        obj.id = ''
    // group by original
    if(!babelnet_predictions[obj.original]) { 
        // there could be multiple ISO codes
        babelnet_predictions[obj.original] = []
    }
    babelnet_predictions[obj.original].push(obj.id)
}

// find how many matches we have
var matches = []
for(var i=0; i<correct.length; i++) {
    var obj = correct[i]
    if(predictions[obj.original] 
        && predictions[obj.original].rank > 0
        && predictions[obj.original].id == obj.id
        ) { // match
        matches.push(predictions[obj.original].rank)
    } else { // try babelnet
        if(babelnet_predictions[obj.original]) { // match
            if(babelnet_predictions[obj.original].indexOf(obj.id) != -1) {
                console.log(obj.original)
                // id found in array
                matches.push(babelnet_predictions[obj.original])
            }
        }
    }
}
console.log('Correct set length: ' + correct.length)
console.log('Matches: ' +matches.length);
console.log('Accuracy: %' + (matches.length/correct.length) * 100)
/*
var sum = 0;
for( var i = 0; i < matches.length; i++ ){
    sum += parseFloat( matches[i], 10 ); //don't forget to add the base
}
console.log('Average correct rank: ' + (sum/matches.length))
console.log('Smallest correct rank: ' + Math.min.apply(null, matches));
*/
