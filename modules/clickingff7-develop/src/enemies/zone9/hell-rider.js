class HellRider extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Hell Rider';

        this.image = '/img/enemies/zone9/hell-rider.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 4;
        this.xp = 4;
        this.ap = 2;
        this.gils = 2;
        // END

        this.weakness = ['poison'];
    }

}