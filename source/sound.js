/** Class: MicroS.Sound

		Incomplete. Not yet functional in all browsers.

	Constructor: Sound

		Creates a new sound object.

		Parameters:
			url - (string) The sound url to load
			play = false - (boolean) Play immediately?
			
		Example:
		
			(code)
			var sound = new MicroS.Sound('sample.wav');
			(end)

	Variable: element

		(<MicroS>) The html element
*/
MicroS.Sound=function(url, play){
	if(!MicroS.Sound.template){
		MicroS.Sound.template=
			MicroS.browser.ie?{
				tag:'bgsound',
				properties:{loop:1,autostart:true},
				url:'src'
			}:MicroS.browser.gecko&&MicroS.os.windows?(
				MicroS.browser.plugin('QuickTime')?{
					tag:'object',
					properties:{type:'audio/mpeg',width:0,height:0},
					url:'data'
				}:MicroS.browser.plugin('Windows Media')?{
					tag:'object',
					properties:{type:'application/x-mplayer2'},
					url:'data'
				}:MicroS.browser.plugin('RealPlayer')?{
					tag:'object',
					properties:{type:'audio/x-pn-realaudio-plugin',loop:false,hidden:true,style:'height:0'},
					src:'src'
				}:false
			):{
				tag:'embed',
				properties:{hidden:true,style:'height:0'},
				url:'src'
			}
		;
	}

	this._active=false;
	this.element=null;
	if(url)
		this.url(url);
	else
		this._url='';
	if(play)this.play();
};

MicroS.Sound.prototype={
	
	/** Method: play
	
		Begins playing of the sound (and optionally sets/changes it).
		
		Parameters:
			url - (string; optional) Sample url to load.
	*/
	play:function(url){
		if(url)this.url(url);
		if(this.element&&!this._active){
			MicroS.body.insert(this.element);
			this.element.element[0].Play&&this.element.element[0].Play();
			this._active=true;
		}
	},
	/** Method: stop
	
		Stops the sound.
	*/
	stop:function(){
		if(this._active){
			this.element.remove();
			this._active=false;
		}
	},
	
	/** Method: url
	
		Sets and/or returns the current url of the sound file.
		
		If a url is specified this sound is stopped (if playing) and changed to the new url.
		
		Parmaters:
		
			url - (string; optional) The url to load.
			
		Returns:
		
			(string) The current/new url.
	*/
	url:function(url){
		if(url){
			this._url=url;
			this.stop();
			var template=MicroS.Sound.template;
			if(template!==false){
				var properties=template.properties;properties[template.url]=url;
				this.element=MicroS.create(template.tag,properties);
				this.element.element[0].setAttribute('autostart',true);
				this.element.element[0].setAttribute('autoplay',true);
			}
		}
		return this._url;
	}
};