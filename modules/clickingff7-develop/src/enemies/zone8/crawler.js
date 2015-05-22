class Crawler extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Crawler';

        this.image = '/img/enemies/zone8/crawler.png';

        // BELOW – rate over 5
        this.hpMax = 1;
        this.hits = 2;
        this.xp = 1;
        this.ap = 1;
        this.gils = 2;
        // END

        this.weakness = ['fire'];
    }

}