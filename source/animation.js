MicroS.Animation=function(time_length,time_start,skippable){
	// all animations MUST be inserted in order
	this.time_start=time_start?time_start:MicroS.frametime();
	this.time_length=time_length;
	this.moving=false;
	this.smooth=!skippable;
	this.property=[];
	this.element=[];
	this.formula=function(x){return x;}
}
MicroS.Animation.prototype={
	add:function(element,time_clear){
		this.element.push(element);
		if(element._micros_animation!=undefined)
			element._micros_animation.push(this);
		else
			element._micros_animation=[this];
		element._micros_animation_end=time_clear?this.time_end():Math.max(element._micros_animation_end||0,this.time_end());

		if(this.moving)
			element._micros_animation_moving=(element._micros_animation_moving||0)+1;
	},
	remove:function(element){
		var element_list;
		if(element!==undefined){
			element_list=[element];
			if(this.element.length==1&&this.element[0]==element)
				this.property=[];
			else{
				for(var I=0;I<this.property.length;I++){
					if(this.property[I].element==element){
						this.property.splice(I,1);
						I--;
					}
				}
			}
			
			if(!this.property.length){
				var index;
				if((index=MicroS._animation.indexOf(this))>=0)
					MicroS._animation.splice(index,1);
			}
		}else
			element_list=this.element;
			
		for(var I=0;I<element_list.length;I++){
			var element=element_list[I];
			if(this.moving)
				element._micros_animation_moving--;
			var list=element._micros_animation;
			var index;if((index=list.indexOf(this))>=0)
				list.splice(index,1);
		}
	},
	next:function(){
		for(var I=0;I<this.element.length;I++)
			MicroS._element_next(this.element[I]);
	},
	time_end:function(){
		return this.time_start+this.time_length;
	}
};