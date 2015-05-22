declare('SaveKeys', function() {
	return {
		idnGameVersion: StrSha('version'),

		idnSettingsInternalInfoToConsole: StrSha('setIntInfoToConsole'),
		idnSettingsInternalWarningToConsole: StrSha('setIntWarningToConsole'),
		idnSettingsInternalLogContexts: StrSha('setIntLogContexts')
	};
});
