class GuardScorpion extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Guard Scorpion';

        this.image = '/img/enemies/zone1/guard-scorpion.png';

        this.boss = true;

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 3;
        this.xp = 3;
        this.ap = 3;
        this.gils = 3;
        // END

        this.weakness = ['bolt'];
    }

}