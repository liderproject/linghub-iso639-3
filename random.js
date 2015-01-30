// chooses 100 random languages from results.json
// in order to be manually annotated for precision/recall tests
var fs = require('fs'),
    readline = require('readline');

var rl = readline.createInterface({
    input: fs.createReadStream('results.json'),
    output: false
});

var count = 0;
var langs = {}

rl.on('line', function(line) {
    var obj = JSON.parse(line)
    var original = obj.original || ''
    if(original)
        langs[original] = true;
});

rl.on('close', function() {
    // convert object langs into array
    var arr = []
    for(var i in langs) {
        arr.push(i)
    }
    var len = arr.length
    // we only want to read 100
    var tot = len - 100

    // now delete random tot from arr
    for(var i = 0; i<tot; i++) {
        var rand = Math.floor(Math.random() * arr.length);
        arr.splice(rand, 1)

    }
    // now save arr to file
    fs.writeFile('random.json', '')
    for(var i=0; i<arr.length; i++) {
        var obj = {}
        obj.lang = arr[i]
        obj.iso = ''
        fs.appendFileSync('random.json', JSON.stringify(obj) + '\n')
    }

})
