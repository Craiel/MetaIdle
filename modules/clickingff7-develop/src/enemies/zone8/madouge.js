class Madouge extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Madouge';

        this.image = '/img/enemies/zone8/madouge.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 3;
        this.xp = 3;
        this.ap = 1;
        this.gils = 3;
        // END

        this.weakness = ['fire'];

        this.resistance = ['earth'];
    }

}