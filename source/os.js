/** Namespace: MicroS.os

	Information about the client operating system.
		
	Group: Device
		
		Variable: mobile
			(boolean) Device is a handheld mobile device
			
			Examples:
		
			(code)
				//Once the page is ready..
				//Check if running on a mobile device..
				//If so, add the class "mobile" to the <body> tag
				
				MicroS.ready(function(){
					if(MicroS.os.mobile){
						MicroS.body.class_add('mobile');
					}
				});
			(end)
			
		Variable: tablet
			(boolean) Device is a tablet device
			
		Variable: iphone
			(boolean) Device is an iPhone
			
		Variable: ipad
			(boolean) Device is an iPad
			
	Group: Operating system

		Variable: windows
			(boolean) Microsoft Windows
			
		Variable: ios
			(boolean) OS
			
		Variable: android
			(boolean) Android
			
		Variable: blackberry
			(boolean) BlackBerry
			
		Variable: webos
			(number) webOS version number (major and minor as a decimal number)
			
		Variable: windows_mobile
			(number) Windows Mobile version number
*/
MicroS.os={};

MicroS.os.iphone =!!navigator.userAgent.match(/\b(iPhone|iPod)\b/);
MicroS.os.ipad   =!!navigator.userAgent.match(/\biPad\b/);

MicroS.os.windows=!!navigator.userAgent.match(/\bWindows\b/);
MicroS.os.ios    =MicroS.os.iphone||MicroS.os.ipad;
MicroS.os.android=!!navigator.userAgent.match(/\bAndroid\b/);
MicroS.os.blackberry=!!navigator.userAgent.match(/\bBlackBerry/);//NOTE: No ending word break. Some are followed (only) by model numbers
MicroS.os.webos  =navigator.userAgent.match(/\bwebOS\/(\d+.?\d*)\b/);if(MicroS.os.webos)MicroS.os.webos=parseFloat(MicroS.os.webos[1]);
MicroS.os.windows_mobile=navigator.userAgent.match(/\b(Windows Phone|IEMobile)(\d+)\b/);if(MicroS.os.windows_mobile)MicroS.os.windows_mobile=MicroS.os.windows_mobile[2];else if(navigator.userAgent.match(/\b(XPLWP7|ZoneWP7)\b/))MicroS.os.windows_mobile=7;

MicroS.os.mobile=MicroS.os.iphone||MicroS.os.android||MicroS.os.blackberry||MicroS.os.webos||MicroS.os.windows_mobile||MicroS.browser.opera_mobile;
MicroS.os.tablet=MicroS.os.ipad;
