class Eligor extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Eligor';

        this.image = '/img/enemies/zone4/eligor.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 3;
        this.xp = 4;
        this.ap = 1;
        this.gils = 1;
        // END

        this.weakness = ['bolt'];
    }

}