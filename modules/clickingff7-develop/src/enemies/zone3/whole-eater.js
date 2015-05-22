class WholeEater extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Whole Eater';

        this.image = '/img/enemies/zone3/whole-eater.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 3;
        this.xp = 2;
        this.ap = 2;
        this.gils = 2;
        // END

        this.weakness = ['fire'];
    }

}