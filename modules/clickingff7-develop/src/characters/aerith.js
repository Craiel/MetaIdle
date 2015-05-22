class Aerith extends Character {

    constructor(game) {
        super(game);

        // name of the character
        this.name = 'Aerith Gainsborough';

        // character image
        this.image = '/img/characters/aerith.jpg';

        // character weapon type
        this.weaponType = 'stave';

        // STATS
        this.hpBase = 1;
        this.mpBase = 5;
        this.xpBase = 2;

        // Character zones available
        this.notA = [4, 5];

    }

}