class SpecialCombatant extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Special Combatant';

        this.image = '/img/enemies/zone2/special-combatant.png';

        // BELOW – rate over 5
        this.hpMax = 3;
        this.hits = 4;
        this.xp = 4;
        this.ap = 1;
        this.gils = 5;
        // END

        this.weakness = ['bolt'];
    }

}