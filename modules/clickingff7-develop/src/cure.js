class Cure {

    /**
     * Init
     * @param pwr
     */
        constructor(pwr) {
        this.pwr = pwr;
    }

    /**
     * Get *random* cure from power
     * @returns {number}
     */
        getCure() {
        // base cure
        var a = this.pwr * (1 - 10 / 100);
        var b = this.pwr * (1 + 10 / 100);

        return Math.round(_.random(a, b));
    }

}