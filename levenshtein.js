/*

Copyright (c) 2014. All Rights reserved.

If you use this script, I'd love to know, thanks!

Andrew Hedges
andrew (at) hedges (dot) name

*/

var levenshteinenator = (function () {

    /**
     * @param String a
     * @param String b
     * @return Array
     */
    function levenshteinenator(a, b) {
        // for my purposes, comparison should not check case or whitespace
        var a = a.replace(/\s/g, "").toLowerCase();
        var b = b.replace(/\s/g, "").toLowerCase();

        var cost;
        var m = a.length;
        var n = b.length;

        // make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
        if (m < n) {
            var c = a; a = b; b = c;
            var o = m; m = n; n = o;
        }

        var r = []; r[0] = [];
        for (var c = 0; c < n + 1; ++c) {
            r[0][c] = c;
        }

        for (var i = 1; i < m + 1; ++i) {
            r[i] = []; r[i][0] = i;
            for ( var j = 1; j < n + 1; ++j ) {
                cost = a.charAt( i - 1 ) === b.charAt( j - 1 ) ? 0 : 1;
                r[i][j] = minimator( r[i-1][j] + 1, r[i][j-1] + 1, r[i-1][j-1] + cost );
            }
        }

        return r;
    }

    /**
     * Return the smallest of the three numbers passed in
     * @param Number x
     * @param Number y
     * @param Number z
     * @return Number
     */
    function minimator(x, y, z) {
        if (x < y && x < z) return x;
        if (y < x && y < z) return y;
        return z;
    }

    return levenshteinenator;

}());
exports.levenshteinenator = levenshteinenator;
