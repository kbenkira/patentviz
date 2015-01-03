$(function(){

	$("#Menu").hide();
	$("#World").hide();

	$("#home_test").mouseover(function(){
		$(this).css("background-color", "rgb(0,154,255)");
	});
	
	$("#home_test").mouseout(function(){
		$(this).css("background-color", "rgb(0,174,239)");
	});
	
	$("#home_test").click(function(){
		$("#Home").animate({
		top:"-1000px"
		},1000);
		$("#Menu").show();		
		$("#menu_logo").delay(1000).animate({
		top:"0px"
		}, 600);	
		$("#menu_search").delay(1200).animate({
		top:"126px"
		}, 600);	
		$("#menu_filter").delay(1400).animate({
		top:"201px"
		}, 600);
	});
});