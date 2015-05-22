class Shop {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;

        this.section = 'buy';
        this.type = 'weapons';
        this.allWeapons = false;
    }

    refresh() {
        this.weapons = [];
        this.materias = [];
        this.items = [];

        var weapons = [
            'BusterSword',
            'GatlingGun',
            'AssaultGun',
            'LeatherGlove',
            'MetalKnuckle',
            'GuardStick',
            'MythrilRod',
            'MythrilSaber',
            'CannonBall',
            'MythrilClaw',
            'FullMetalStaff',
            'FPtShuriken'
        ];
        for (var w of weapons) {
            var weapon = new window[w](this.game);
            if (weapon.zoneAvailable <= this.game.zones.levelMax && (this.allWeapons || weapon.inStock() === 0)) {
                this.weapons.push(weapon);
            }
        }

        var materias = [
            'Restore',
            'Bolt',
            'Ice',
            'Fire',
            'Poison',
            'Earth',
            'ChocoMog'
        ];
        for (var m of materias) {
            var materia = new window[m](this.game);
            if (materia.zoneAvailable <= this.game.zones.levelMax) {
                this.materias.push(materia);
            }
        }

        var items = [
            'Potion',
            'Ether',
            'HiPotion',
            'HiEther'
        ];
        for (var i of items) {
            var item = new window[i](this.game);
            if (item.available(this.game.zones.levelMax)) {
                this.items.push(item);
            }
        }
    }

    /**
     * Enable a shop option
     * @param option
     */
    enable(option) {
        this[option] = true;
        this.refresh();
    }

    /**
     * Disable a shop option
     * @param option
     */
    disable(option) {
        this[option] = false;
        this.refresh();
    }


}