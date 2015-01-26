var fs = require('fs')
var parse = require('csv-parse')

fs.readFile('language.csv', 'utf-8', function(err, data) {
    if(err) return console.log(err)
    parse(data, function(err, output) {
        if(err) return console.log(err)
        // output is array of arrays (rows)
        var ret = []
        for(var i in output) {
            var row = output[i]
            // second column is the string
            var langs = row[1]
            // they're surrounded by double quotes
            // JSON.parse thinks it's a JSON string
            langs = JSON.parse(langs)
            // try splitting by , or ;
            langs = langs.split(',')
            for(var x in langs) {
                var arr = langs[x].split(';') 
                for(var y in arr) {
                    // finally trim
                    ret.push(arr[y].trim())
                }
            }
            console.log(ret)
        }
    })
})
