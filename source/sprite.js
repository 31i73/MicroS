/** Class: MicroS.Sprite

	A positionable graphic element well-suited for games.
	
	It consists of a parent, a position (that marks it's centre), a radius, and a graphic.
	It also features basic collision checking.
*/
(MicroS.Sprite=function(parent,position,path){
	var self=this;
	this.parent=parent;
	this._path=path;
	this.element=parent.create('div',{style:'position:absolute;top:'+position[1]+'px;left:'+position[0]+'px;background:url('+path+') no-repeat'});
	this.collision_scale=[1,1];
	//this.element=parent.create('img',{style:'position:absolute;top:'+position[1]+'px;left:'+position[0]+'px',src:path});
	
	var image_size_cache;if(image_size_cache=MicroS._image_size_cache[path]){
		this.radius=[image_size_cache[0]/2,image_size_cache[1]/2];
		this.element.style({
			width:this.radius[0]*2+'px',
			height:this.radius[0]*2+'px',
			marginLeft:-this.radius[0]+'px',
			marginTop:-this.radius[1]+'px'
		});
	}else{
		this.radius=[0,0];
		var image=new Image();
		image.removeAttribute('width');
		image.removeAttribute('height');
		this._image=new MicroS(image);
		this._image.listen('load',function(){self._event_loaded.apply(self,[image]);});
		this._image.element[0].src=path;
	}
}).prototype={
	/** Constructor: Sprite
	
		Creates a new sprite.
	
		Parameters:
		
			parent - (<MicroS>) Sprite parent.
			position - (number[2]) Sprite position.
			path - (string) Sprite url.
			
		Example:
		
			(code)
			var level = MicroS.id('level');
			var sprite = new MicroS.Sprite(level, [100,20], 'player.gif');
			(end)
	*/
	
	/** Group: properties */
	/**
		Variable: element
			(<MicroS>) HTML element.

		Variable: parent
			(<MicroS>; readonly) Parent element.
			
		Variable: radius
			(number[2]; readonly) The sprite radius.
	*/

	/** Group: methods */
	/** Method: graphic
	
		Get or set the current graphic url.
		
		Parameters:
			set - (string; optional) The graphic url to set.
			
		Returns:
			(number[2]) The current/new graphic url.
	*/
	graphic:function(set,animate_size){
		if(set){
			if(set!=this._path){
				this.element.style({backgroundImage:'url('+set+')'});
				//this.element.element[0].src=set;
				this._path=set;
			}
		}else
			return this._path;
	},
	
	/** Method: position
	
		Get or set the current position.
		
		Parameters:
			set - (number[2]; optional) The position to set.
			
		Returns:
			(number[2]) The current/new position.
	*/
	position:function(set){//TODO:move to MicroS.position & bubble back from there
		var element=this.element.element[0];
		if(set){
			element._micros_position=[set[0],set[1]];
			element.style.top =set[1]+'px';
			element.style.left=set[0]+'px';
		}else{
			if(element._micros_position===undefined){
				element._micros_position=[
					parseFloat(this.element.style('left')[0]),
					parseFloat(this.element.style('top' )[0])
				];
			}
		}
		return [element._micros_position[0],element._micros_position[1]];
	},
	/** Method: overlap
	
		Tests whether the sprite overlaps another.
		
		Parameters:
			sprite - (<MicroS.Sprite>) The sprite to test against.
			
		Returns:
			(boolean) Whether the 2 sprites overlap.
			
		Examples:
		
			(code)
			if(player.sprite.overlap(bullet)){
				bullet.remove();
				player.damage();
			}
			(end)
	*/
	overlap:function(sprite){
		var a=this.position();
		var b=sprite.position();
		return (
			Math.abs(a[0]-b[0])<=(this.radius[0]*this.collision_scale[0]+sprite.radius[0]*sprite.collision_scale[0])&&
			Math.abs(a[1]-b[1])<=(this.radius[1]*this.collision_scale[1]+sprite.radius[1]*sprite.collision_scale[1])
		);
	},
	/** Method: remove
	
		Removes the sprite from the document.
	*/
	remove:function(){
		this.image=undefined;
		this.element.remove();
	},
	_event_loaded:function(image){
		this.radius=MicroS._image_size_cache[this._path]=[image.naturalWidth||image.width,image.naturalHeight||image.height];
		this.radius=[this.radius[0]/2,this.radius[1]/2];
		
		this.element.style({
			width:this.radius[0]*2+'px',
			height:this.radius[1]*2+'px',
			marginLeft:-this.radius[0]+'px',
			marginTop:-this.radius[1]+'px'
		});

		this._image=undefined;
	}
}