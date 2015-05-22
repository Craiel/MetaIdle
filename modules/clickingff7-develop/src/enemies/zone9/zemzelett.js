class Zemzelett extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Zemzelett';

        this.image = '/img/enemies/zone9/zemzelett.png';

        // BELOW – rate over 5
        this.hpMax = 3;
        this.hits = 3;
        this.xp = 3;
        this.ap = 4;
        this.gils = 1;
        // END

        this.weakness = ['fire'];
    }

}