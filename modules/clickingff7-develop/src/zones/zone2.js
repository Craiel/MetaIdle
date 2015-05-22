class Zone2 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 2;

        this.image = "/img/zones/Sector_5_Reactor.png";

        this.enemies = [
            "BloodTaste",
            "ProtoMachinegun",
            "Smogger",
            "SpecialCombatant"
        ];

        this.boss = [
            "AirBuster"
        ];
    }

}