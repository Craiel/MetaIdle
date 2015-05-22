class Loader {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;

        // list all files
        this.files = [
            {label  : "Loading main files (1/2)",
                list: [
                    "dist/attack.js",
                    "dist/battle.js",
                    "dist/characters.js",
                    "dist/character.js",
                    "dist/cure.js",
                    "dist/enemies.js",
                    "dist/enemy.js",
                    "dist/item.js",
                    "dist/items.js",
                    "dist/materia.js",
                    "dist/materias.js",
                    "dist/shop.js",
                    "dist/weapon.js",
                    "dist/weapons.js",
                    "dist/zone.js",
                    "dist/zones.js"
                ]},
            {label  : "Loading main files (2/2)",
                list: [
                    "dist/materias/attack-materia.js",
                    "dist/materias/cure-materia.js"
                ]},
            {label  : "Loading resource files",
                list: [
                    "dist/characters/barret.js",
                    "dist/characters/cloud.js",
                    "dist/characters/tifa.js",
                    "dist/characters/aerith.js",
                    "dist/characters/red-xiii.js",
                    "dist/characters/yuffie.js",
                    "dist/enemies/zone1/first-ray.js",
                    "dist/enemies/zone1/grunt.js",
                    "dist/enemies/zone1/guard-scorpion.js",
                    "dist/enemies/zone1/mp.js",
                    "dist/enemies/zone1/sweeper.js",
                    "dist/enemies/zone2/air-buster.js",
                    "dist/enemies/zone2/blood-taste.js",
                    "dist/enemies/zone2/proto-machinegun.js",
                    "dist/enemies/zone2/smogger.js",
                    "dist/enemies/zone2/special-combatant.js",
                    "dist/enemies/zone3/aps.js",
                    "dist/enemies/zone3/hedgehog-pie.js",
                    "dist/enemies/zone3/hell-house.js",
                    "dist/enemies/zone3/vice.js",
                    "dist/enemies/zone3/whole-eater.js",
                    "dist/enemies/zone4/aero-combatant.js",
                    "dist/enemies/zone4/deenglow.js",
                    "dist/enemies/zone4/eligor.js",
                    "dist/enemies/zone4/guard-hound.js",
                    "dist/enemies/zone4/reno.js",
                    "dist/enemies/zone5/mighty-grunt.js",
                    "dist/enemies/zone5/sample-h0512.js",
                    "dist/enemies/zone5/soldier-3rd.js",
                    "dist/enemies/zone5/sword-dance.js",
                    "dist/enemies/zone5/vargid-police.js",
                    "dist/enemies/zone6/heli-gunner.js",
                    "dist/enemies/zone6/hundred-gunner.js",
                    "dist/enemies/zone6/motor-ball.js",
                    "dist/enemies/zone6/rufus.js",
                    "dist/enemies/zone6/zenene.js",
                    "dist/enemies/zone7/elfadunk.js",
                    "dist/enemies/zone7/kalm-fang.js",
                    "dist/enemies/zone7/levrikon.js",
                    "dist/enemies/zone7/mandragora.js",
                    "dist/enemies/zone7/midgar-zolom.js",
                    "dist/enemies/zone8/crawler.js",
                    "dist/enemies/zone8/castanets.js",
                    "dist/enemies/zone8/madouge.js",
                    "dist/enemies/zone8/ark-dragon.js",
                    "dist/enemies/zone8/mystery-ninja.js",
                    "dist/enemies/zone9/bottomswell.js",
                    "dist/enemies/zone9/capparwire.js",
                    "dist/enemies/zone9/formula.js",
                    "dist/enemies/zone9/hell-rider.js",
                    "dist/enemies/zone9/zemzelett.js",
                    "dist/items/potion.js",
                    "dist/items/ether.js",
                    "dist/items/hi-potion.js",
                    "dist/items/hi-ether.js",
                    "dist/materias/green/restore.js",
                    "dist/materias/green/bolt.js",
                    "dist/materias/green/ice.js",
                    "dist/materias/green/fire.js",
                    "dist/materias/green/poison.js",
                    "dist/materias/green/earth.js",
                    "dist/materias/red/choco-mog.js",
                    "dist/weapons/broadswords/bustersword.js",
                    "dist/weapons/broadswords/mythril-saber.js",
                    "dist/weapons/gun-arms/gatling-gun.js",
                    "dist/weapons/gun-arms/assault-gun.js",
                    "dist/weapons/gun-arms/cannon-ball.js",
                    "dist/weapons/knuckles/leather-glove.js",
                    "dist/weapons/knuckles/metal-knuckle.js",
                    "dist/weapons/knuckles/mythril-claw.js",
                    "dist/weapons/staves/guard-stick.js",
                    "dist/weapons/staves/mythril-rod.js",
                    "dist/weapons/staves/full-metal-staff.js",
                    "dist/weapons/headdresses/mythril-clip.js",
                    "dist/weapons/shurikens/f-pt-shuriken.js",
                    "dist/zones/zone1.js",
                    "dist/zones/zone2.js",
                    "dist/zones/zone3.js",
                    "dist/zones/zone4.js",
                    "dist/zones/zone5.js",
                    "dist/zones/zone6.js",
                    "dist/zones/zone7.js",
                    "dist/zones/zone8.js",
                    "dist/zones/zone9.js"
                ]}
        ];

        this.filesLoaded = 0;
        this.filesRemain = this.getNbFiles();
        this.nbFiles = this.getNbFiles();
        this.currentLabel = '';

        // load
        this.run();
    }

    /**
     * Load a group of files
     * @param group
     */
        run(group = 0) {
        var that = this;
        var groupRemain = this.files[group].list.length;
        this.currentLabel = this.files[group].label;

        for (var file of this.files[group].list) {

            head.load(file, function () {
                groupRemain--;
                that.filesRemain--;
                that.filesLoaded++;
                that.game.$rootScope.$apply();
                if (that.filesRemain === 0) {
                    that.game.run();
                } else if (groupRemain === 0) {
                    that.run(++group);
                }
            });
        }
    }

    /**
     * Return number of groups
     * @returns {Number}
     */
        getNbGroups() {
        return this.files.length;
    }

    /**
     * Return number of files to load
     * @returns {number}
     */
        getNbFiles() {
        var i = 0;
        for (var group of this.files) {
            for (var file of group.list) {
                i++;
            }
        }
        return i;
    }

    /*
     * @param pixels_max
     * @returns {number}
     */
    loadProgress(pixels_max) {
        return (this.filesLoaded == 0 ? 0 : this.filesLoaded / this.nbFiles * pixels_max);
    }

}