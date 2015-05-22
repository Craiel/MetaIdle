declare('Settings', function () {
    include('Component');
    include('Save');
    include('SaveKeys');

    Settings.prototype = component.prototype();
    Settings.prototype.$super = parent;
    Settings.prototype.constructor = Settings;

    function Settings() {
        component.construct(this);

        this.id = "Settings";

        this.logContextDefaultValue = true;

        save.register(this, saveKeys.idnSettingsInternalInfoToConsole).asBool().withDefault(false);
        save.register(this, saveKeys.idnSettingsInternalWarningToConsole).asBool().withDefault(false);
        save.register(this, saveKeys.idnSettingsInternalLogContexts).asJson();
    }

    // ---------------------------------------------------------------------------
    // basic functions
    // ---------------------------------------------------------------------------
    Settings.prototype.componentInit = Settings.prototype.init;
    Settings.prototype.init = function(baseStats) {
        this.componentInit();

    };

    Settings.prototype.componentUpdate = Settings.prototype.update;
    Settings.prototype.update = function(gameTime) {
        if(this.componentUpdate(gameTime) !== true) {
            return false;
        }


        return true;
    };

    // ---------------------------------------------------------------------------
    // setting functions
    // ---------------------------------------------------------------------------
    Settings.prototype.getLogContextEnabled = function(context) {
        if(this[saveKeys.idnSettingsInternalLogContexts][context] !== undefined) {
            return this[saveKeys.idnSettingsInternalLogContexts][context];
        }

        return this.logContextDefaultValue;
    };

    Settings.prototype.setLogContextEnabled = function(context, value) {
        if(this[saveKeys.idnSettingsInternalLogContexts][context] === undefined) {
            this[saveKeys.idnSettingsInternalLogContexts][context] = this.logContextDefaultValue;
        }

        this[saveKeys.idnSettingsInternalLogContexts][context] = value;
    };

    return new Settings();

});