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
	}
});

function activate(object){
	iconActive(object);
	$(object).addClass("activate");
}

function unactivate(object){
	iconUnactive(object);
	$(object).removeClass("activate");
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