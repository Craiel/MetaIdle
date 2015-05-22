class Attack {

    /**
     * Init
     * @param pwr
     * @param type
     */
        constructor(pwr, type) {
        this.pwr = pwr;
        this.type = type ? type : [];
    }

    /**
     * Get *random* hits from power
     * @returns {number}
     */
    getHits() {
        // base hits
        var a = this.pwr * (1 - 10 / 100);
        var b = this.pwr * (1 + 10 / 100);
        var hits = Math.round(_.random(a, b));

        // critical hits (10%)
        var r = _.random(0, 100);
        if (r <= 10) {
            hits *= 2;
        }

        return hits;
    }

}