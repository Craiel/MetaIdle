class HellHouse extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Hell House';

        this.image = '/img/enemies/zone3/hell-house.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 3;
        this.xp = 5;
        this.ap = 2;
        this.gils = 2;
        // END

        this.weakness = ['ice'];
    }

}