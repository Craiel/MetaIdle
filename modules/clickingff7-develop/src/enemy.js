class Enemy {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;
    }

    /**
     * Get the enemy to the given level
     * @param levelSum
     * @private
     */
        _toLevel(levelSum) {

        // Difficulty
        levelSum *= (1 + (this.game.difficulty - 2) * 20 / 100);
        levelSum = Math.ceil(levelSum);

        this.level = Math.ceil(levelSum / 3);

        this._hpMax = Math.ceil(((this.hpMax - 3) * 10 / 100 + 1) * 25 * levelSum);
        this._hits = Math.ceil(((this.hits - 3) * 10 / 100 + 1) * levelSum);
        this._xp = Math.ceil(((this.xp - 3) * 10 / 100 + 1) * 5 * levelSum);
        this._ap = Math.ceil(((this.ap - 3) * 10 / 100 + 1) * 2 * levelSum);
        this._gils = Math.ceil(((this.gils - 3) * 10 / 100 + 1) * (30 + levelSum));
    }

    /**
     * Returns enemy HP
     * @return {int}
     */
        getHpMax() {
        return this._hpMax;
    }

    /**
     * Returns enemy pwr
     * @return {int}
     */
        getHits() {
        return this._hits;
    }

    /**
     * returns enemy XP reward
     * @return {int}
     */
        xpReward() {
        return this._xp;
    }

    /**
     * returns enemy AP reward
     * @return {int}
     */
        apReward() {
        return this._ap;
    }

    /**
     * returns enemy gils reward
     * @return {int}
     */
        gilsReward() {
        return this._gils;
    }

}