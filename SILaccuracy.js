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
var data = fs.readFileSync('results.json', 'utf-8')
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
    if(predictions[obj.id]) { // check rank
        if(obj.rank > predictions[obj.id].rank) {
            // replace it
            obj.rank = predictions[obj.id].rank
        }
    }
    predictions[obj.id] = {
        rank: obj.rank,
        original: obj.original
    }
}

// find how many matches we have
var matches = 0
for(var i=0; i<correct.length; i++) {
    var obj = correct[i]
    if(predictions[obj.id] && predictions[obj.id].rank > 0) { // match
        matches++;
        console.log(predictions[obj.id])
    }
}
console.log('Correct set length: ' + correct.length)
console.log('Matches: ' +matches);
console.log('Accuracy: %' + (matches/correct.length) * 100)
