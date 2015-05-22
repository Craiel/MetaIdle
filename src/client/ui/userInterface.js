declare('UserInterface', function() {
    include('Log');
    include('Component');
    include('Game');
    include('TemplateProvider');
    include('EventAggregate');
    include('StaticData');
    include('CoreUtils');

    UserInterface.prototype = component.prototype();
    UserInterface.prototype.$super = parent;
    UserInterface.prototype.constructor = UserInterface;

    function UserInterface() {
        component.construct();

        this.id = "UserInterface";

        this.defaultNotifyOptions = {
            newest_on_top: true,
            placement: {from: "bottom", align: "right"},
            delay: 1000//,
            //timer: 1000
        };

        this.moduleNav = {};
        this.moduleContent = {};
        this.activeModule = undefined;
    }

    // ---------------------------------------------------------------------------
    // basic functions
    // ---------------------------------------------------------------------------
    UserInterface.prototype.componentInit = UserInterface.prototype.init;
    UserInterface.prototype.init = function() {
        this.componentInit();

        this.initModules();

        this.notifyInfo("MetaIdle Initialized!");
    };

    UserInterface.prototype.componentUpdate = UserInterface.prototype.update;
    UserInterface.prototype.update = function(gameTime) {
        if(this.componentUpdate(gameTime) !== true) {
            return false;
        }

        return true;
    };

    // ---------------------------------------------------------------------------
    // interface functions
    // ---------------------------------------------------------------------------
    UserInterface.prototype.initModules = function() {
        var modules = game.getModules();

        var moduleTabListMain = $('#moduleTabList');
        var moduleContentMain = $('#modulePage');
        for(var key in modules) {
            var module = modules[key];

            var navElement = $(templateProvider.GetTemplate('moduleNavElement', {id: module.id, title: module.title}));
            navElement.click({self: this, module: module.id}, this.activateModule);
            moduleTabListMain.append(navElement);
            this.moduleNav[module.id] = navElement;

            var content = templateProvider.GetTemplate(module.id, {root: 'modules/' + module.path });
            var contentElement = $(templateProvider.GetTemplate('moduleContentElement', {id: module.id, title: module.title, content: content}));
            this.moduleContent[module.id] = contentElement;

            if(this.activeModule === undefined) {
                this.activeModule = key;
            }
        }

        // Activate the default module
        this.activateModule({data: {self: this, module: this.activeModule}});
    };

    UserInterface.prototype.activateModule = function(args) {
        var self = args.data.self;
        var module = args.data.module;
        log.info('Activating ' + self.activeModule + " -> " + module);
        self.moduleContent[self.activeModule].remove();
        self.moduleNav[self.activeModule].removeClass('active');

        self.activeModule = module;

        var moduleContentMain = $('#modulePage');
        moduleContentMain.append(self.moduleContent[self.activeModule]);
        self.moduleNav[self.activeModule].addClass('active');
    };

    UserInterface.prototype.notifyWarning = function (message) {
        var args = $.extend({type: 'warning'}, this.defaultNotifyOptions);
        $.notify({message: message}, args);
    };

    UserInterface.prototype.notifyInfo = function (message) {
        var args = $.extend({type: 'info'}, this.defaultNotifyOptions);
        $.notify({message: message}, args);
    };

    UserInterface.prototype.notifyError = function (message) {
        var args = $.extend({type: 'danger'}, this.defaultNotifyOptions);
        $.notify({message: message}, args);
    };

    return new UserInterface();
});