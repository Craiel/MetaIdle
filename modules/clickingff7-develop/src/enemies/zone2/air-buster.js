class AirBuster extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Air Buster';

        this.image = '/img/enemies/zone2/air-buster.png';

        this.boss = true;

        // BELOW – rate over 5
        this.hpMax = 5;
        this.hits = 5;
        this.xp = 5;
        this.ap = 5;
        this.gils = 5;
        // END

        this.weakness = ['bolt'];
    }

}