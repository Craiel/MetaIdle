class Yuffie extends Character {

    constructor(game) {
        super(game);

        // name of the character
        this.name = 'Yuffie Kisaragi';

        // character image
        this.image = '/img/characters/yuffie.jpg';

        // character weapon type
        this.weaponType = 'shuriken';

        // STATS
        this.hpBase = 1;
        this.mpBase = 4;
        this.xpBase = 4;

        // Character zones available
        this.notA = [];

    }

}