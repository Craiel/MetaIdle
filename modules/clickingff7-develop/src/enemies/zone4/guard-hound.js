class GuardHound extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Guard Hound';

        this.image = '/img/enemies/zone4/guard-hound.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 2;
        this.xp = 2;
        this.ap = 4;
        this.gils = 1;
        // END

        this.weakness = ['fire'];
    }

}