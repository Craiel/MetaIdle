class Formula extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Formula';

        this.image = '/img/enemies/zone9/formula.png';

        // BELOW – rate over 5
        this.hpMax = 3;
        this.hits = 2;
        this.xp = 3;
        this.ap = 2;
        this.gils = 3;
        // END

        this.weakness = ['wind'];
    }

}