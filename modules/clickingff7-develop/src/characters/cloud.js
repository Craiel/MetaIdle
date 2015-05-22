class Cloud extends Character {

    constructor(game) {
        super(game);

        // name of the character
        this.name = 'Cloud Strife';

        // character image
        this.image = '/img/characters/cloud.jpg';

        // character weapon type
        this.weaponType = 'broadsword';

        // STATS
        this.hpBase = 3;
        this.mpBase = 3;
        this.xpBase = 3;

        // Character zones available
        this.notA = [];

    }

}