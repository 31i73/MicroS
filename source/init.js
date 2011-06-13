MicroS.window
	.listen('resize',function(){
		MicroS.layout();
	})
	.listen('MozBeforePaint',function(){
		MicroS.event_tick();
	})
;

MicroS.is_ready=false;

MicroS._event_ready=function(){
	if(!MicroS.is_ready){
		MicroS.document=new MicroS(document);
		MicroS.body=new MicroS(document.body);
		
		MicroS.is_ready=true;
		
		MicroS.document
			.listen('mousemove',function(event){
				var x=event.cursor[0];
				var y=event.cursor[1];
				MicroS.cursor=[x,y];
				if(MicroS._drag.length){
					if(
						!MicroS._drag_active&&
						Math.abs(x-MicroS._drag_start[0])+Math.abs(y-MicroS._drag_start[1])>8
					){
						for(var I=0;I<MicroS._drag.length;I++)
							if(!MicroS._drag[I].element.trigger('dragstart')){
								MicroS.drag(false);
								return;
							}

						MicroS._drag_active=true;
						MicroS.create_overlay()
							.style({zIndex:9999})
							.element[0].id='_MicroS_drag_overlay'
						;
					}
					if(MicroS._drag_active){
						for(var I=0;I<MicroS._drag.length;I++){
							var drag=MicroS._drag[I];
							drag.element.element[0].style.left=Math.min(Math.max(x+drag.x,drag.x_min),drag.x_max)+'px';
							drag.element.element[0].style.top =Math.min(Math.max(y+drag.y,drag.y_min),drag.y_max)+'px';
							drag.element.trigger('dragmove');
						}
					}
				}
			})
			.listen('mouseup',function(event){
				MicroS.drag(false);
			})
		;			
		
		MicroS.window.trigger('ready');
	}
};

if(document.readyState==='complete'){
	MicroS.next(MicroS._event_ready);
}else{
	if(document.addEventListener){
		document.addEventListener('DOMContentLoaded',MicroS._event_ready,false);
		window.addEventListener('load',MicroS._event_ready,false);
	}else if(document.attachEvent){
		document.attachEvent('onreadystatechange',function(){if(document.readyState==="complete")MicroS._event_ready();});
		window.attachEvent('onload',MicroS._event_ready);
	}
}