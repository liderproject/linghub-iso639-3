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
    if(!predictions[obj.original]) { 
        // there could be multiple ISO codes
        predictions[obj.original] = []
    }
    predictions[obj.original].push(obj.id)
}

// find how many matches we have
var matches = []
for(var i=0; i<correct.length; i++) {
    var obj = correct[i]
    if(predictions[obj.original]) { // match
        if(predictions[obj.original].indexOf(obj.id) != -1) {
            // id found in array
            matches.push(predictions[obj.original])
        }
    }
}
console.log('Correct set length: ' + correct.length)
console.log('Matches: ' +matches.length);
console.log('Accuracy: %' + (matches.length/correct.length) * 100)
