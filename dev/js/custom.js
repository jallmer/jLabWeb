// templatemo 467 easy profile
// PRELOADER

$(window).load(function(){
    $('.preloader').delay(1000).fadeOut("slow"); // set duration in brackets
});

// HOME BACKGROUND SLIDESHOW
$(function(){
    jQuery(document).ready(function() {
		$('body').backstretch([
	 		 "background.1.png",
	 		 "background.2.png",
			 "background.3.png"
	 			], 	{duration: 3200, fade: 1300});
		});
});
