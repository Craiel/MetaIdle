class Bottomswell extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Bottomswell';

        this.image = '/img/enemies/zone9/bottomswell.png';

        this.boss = true;

        // BELOW – rate over 5
        this.hpMax = 5;
        this.hits = 5;
        this.xp = 5;
        this.ap = 5;
        this.gils = 5;
        // END

        this.weakness = ['bolt', 'wind'];

        this.resistance = ['ice', 'earth'];
    }

}