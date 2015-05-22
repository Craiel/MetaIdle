class AeroCombatant extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Aero Combatant';

        this.image = '/img/enemies/zone4/aero-combatant.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 2;
        this.xp = 3;
        this.ap = 1;
        this.gils = 3;
        // END

        this.weakness = ['bolt'];
    }

}