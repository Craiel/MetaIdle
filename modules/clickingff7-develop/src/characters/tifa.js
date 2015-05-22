class Tifa extends Character {

    constructor(game) {
        super(game);

        // name of the character
        this.name = 'Tifa Lockhart';

        // character image
        this.image = '/img/characters/tifa.jpg';

        // character weapon type
        this.weaponType = 'knuckle';

        // STATS
        this.hpBase = 2;
        this.mpBase = 2;
        this.xpBase = 3;

        // Character zones available
        this.notA = [3];

    }

}