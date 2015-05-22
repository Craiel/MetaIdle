class ArkDragon extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Ark Dragon';

        this.image = '/img/enemies/zone8/ark-dragon.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 4;
        this.xp = 3;
        this.ap = 3;
        this.gils = 1;
        // END

        this.weakness = ['fire'];

        this.resistance = ['earth'];
    }

}