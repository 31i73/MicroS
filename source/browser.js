/** Namespace: MicroS.browser

	Information about the client browser.

	Example:
		(code)
			//If running firefox version 3.6 or later, or google chrome 10.0 or later
			if(MicroS.browser.firefox>=3.6||MicroS.browser.chrome>=10.0){
				...
			}
		(end)
*/
MicroS.browser={
	/**
		Variable: ie
			(number) Internet Explorer version number
			
		variable: gecko
			(boolean) Browser is Gecko-based
			
		variable: firefox
			(number) Firefox version number (major and minor as a decimal number)
			
		variable: chrome
			(number) Google chrome version number (major and minor as a decimal number)
			
		Variable: webkit
			(boolean) Browser is webkit-based
			
		Variable: opera
			(boolean) Browser is opera-based
			
		Variable: opera_mobile
			(boolean) Browser is opera-mobile
	*/
		
	_plugins:null,
	/** Function: plugin
	
		Returns whether or not the plugin specified is present.
		
		(Performs a case-insensitive search for the separated word in the plugins() list)
		
		Non-functional in Internet Explorer (returns false)
		
		Parameters:
		
			name - (string) Name of plugin to check for
			
		Returns:
		
			(boolean) whether plugin is present
	
		Examples:
			(code)
			if(MicroS.browser.plugin('QuickTime'))
				alert('QuickTime present');
			(end)
			
		See also:
			<MicroS.browser.plugins>
	*/
	plugin:function(name){
		return !!this.plugins().match(new RegExp('\\b'+name+'\\b','i'));
	},
	
	/** Function: plugins
	
		Returns a string of all browser plugins, each name on a separate line (for easy regex matching).
		
		Results are cached once called once.
		
		Non-functional in Internet Explorer (an empty string is returned)
		
		Returns:
		
			(string) newline-seperated list of browser plugins.
		
		Example:
			(code)
			var match;
			if(match = MicroS.browser.plugins().match(/\bQuickTime Plug-in ([0-9.]+)\b/)
				alert('QuickTime version ' + match[1] + ' found');
			(end)
			
		See also:
			<MicroS.browser.plugin>
	*/
	plugins:function(){
		if(!this._plugins){
			this._plugins='';
			if(navigator.plugins)for(var I=0;I<navigator.plugins.length;I++)
				this._plugins+=(I?'\n':'')+navigator.plugins[I].name;
		}
		return this._plugins;
	},

	/** Namespace: MicroS.browser.support
		Information about the client browser's supported functionality */
	support:{
		/** Function: css_transition
		
			If css transitions are supported this will return the name of the css property used.
			
			Otherwise returns false.
		*/
		css_transition: function () {
			var style = document.body.style;
			return (this.css_transition = style.transition !== undefined ?
			function () {
				return 'transition';
			} : style.webkitTransition !== undefined ?
			function () {
				return '-webkit-transition';
			} : style.MozTransition !== undefined ?
			function () {
				return '-moz-transition';
			} : style.oTransition !== undefined ?
			function () {
				return '-o-transition';
			} : MicroS.no)();
		},
		/** Function: css_transform
		
			If css transformations are supported this will return the name of the css property used.
			
			Otherwise returns false.
		*/
		css_transform: function () {
			var style = document.body.style;
			return (this.css_transform = style.transform !== undefined ?
			function () {
				return 'transform';
			} : style.webkitTransform !== undefined ?
			function () {
				return '-webkit-transform';
			} : style.MozTransform ?
			function () {
				return '-moz-transform';
			} : style.oTransform ?
			function () {
				return '-o-transform';
			} : MicroS.no)();
		}
	}
};

MicroS.browser.ie     =navigator.userAgent.match(/\bMSIE (\d+)\b/);if(MicroS.browser.ie)MicroS.browser.ie=MicroS.browser.ie[1];
MicroS.browser.gecko  =!this.opera&&!!navigator.userAgent.match(/\bGecko\b/)&&!navigator.userAgent.match(/\bKHTML\b/);
MicroS.browser.firefox=navigator.userAgent.match(/\bFirefox\/(\d+.?\d*)\b/);if(MicroS.browser.firefox)MicroS.browser.firefox=parseFloat(MicroS.browser.firefox[1]);
MicroS.browser.chrome =navigator.userAgent.match(/\bChrome\/(\d+.?\d*)\b/);if(MicroS.browser.chrome)MicroS.browser.chrome=parseFloat(MicroS.browser.chrome[1]);
MicroS.browser.webkit =!this.opera&&!!navigator.userAgent.match(/\b(?:Apple)?WebKit\b/);
MicroS.browser.opera_mobile=!!navigator.userAgent.match(/\bOpera Mobi\b/)||(!!navigator.userAgent.match(/\bOpera\b/)&&!!navigator.userAgent.match(/\bHTC_/));
MicroS.browser.opera       =!this.opera_mobile && !! navigator.userAgent.match(/\bOpera\b/);