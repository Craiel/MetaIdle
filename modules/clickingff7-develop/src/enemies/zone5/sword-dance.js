class SwordDance extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Sword Dance';

        this.image = '/img/enemies/zone5/sword-dance.png';

        // BELOW – rate over 5
        this.hpMax = 1;
        this.hits = 3;
        this.xp = 1;
        this.ap = 1;
        this.gils = 0;
        // END

        this.weakness = ['bolt'];
    }

}