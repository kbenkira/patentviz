$(".icone").mouseover(function(){
	if(!$(this).hasClass("activate")){
		iconActive(this);
	}
});

$(".icone").mouseout(function(){
	if(!$(this).hasClass("activate")){
		iconUnactive(this);
	}
});

$(".icone").click(function(){
	if(!$(this).hasClass("activate")){
		unactivate($(".activate"));
		$(this).addClass("activate");
		activate($(".activate"));
	}
});

function activate(object){
	$(object).addClass("activate");
	$("."+object.attr('id')+"Chart").show();
}

function unactivate(object){
	iconUnactive(object);
	$(object).removeClass("activate");
	$("."+object.attr('id')+"Chart").hide();
}

function iconActive(object){
	var nameFilePNG = $(object).attr("src");
	nameFilePNG = nameFilePNG.replace(".png", "2.png");
	$(object).attr("src", nameFilePNG);
}

function iconUnactive(object){
	var nameFilePNG = $(object).attr("src");
	nameFilePNG = nameFilePNG.replace("2.png", ".png");
	$(object).attr("src", nameFilePNG);
}