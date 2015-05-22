class Elfadunk extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Elfadunk';

        this.image = '/img/enemies/zone7/elfadunk.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 2;
        this.xp = 1;
        this.ap = 2;
        this.gils = 1;
        // END

        this.weakness = ['earth'];
    }

}