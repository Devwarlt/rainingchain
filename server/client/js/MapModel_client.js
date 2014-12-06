//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN

(function(){ //}

MapModel = function(quest,name,x,y){
	var tmp = {
		id:quest + '-' + name,
		graphicPath:'',
		quest:quest,
		subId:name,
		name:'',	//init in MapModel.initName using server signInPack
		img:{
			a:[],
			b:[],
			m:null,
		},
		sizeX:x,
		sizeY:y,
		imageLoaded:false,		
	};
	DB[tmp.id] = tmp;
}	
var DB = MapModel.DB = {};
	
MapModel.getFullPath = function(graphicPath,layer,x,y){
	if(layer === 'm') return graphicPath + 'M.png';
	return graphicPath + layer.capitalize() + '_(' + x + ',' + y + ')' + '.png';
}
MapModel.initImage = function(map){
	if(map.imageLoaded) return ERROR(3,'already loaded images');
	//layer
	for(var i = 0 ; i <= map.sizeX; i++){
		map.img.a[i] = [];
		map.img.b[i] = [];
		for(var j = 0 ; j <= map.sizeY; j++){
			map.img.a[i].push(Img.load(MapModel.getFullPath(map.graphicPath,'a',i,j)));
			map.img.b[i].push(Img.load(MapModel.getFullPath(map.graphicPath,'b',i,j)));
		}
	}
	//minimap
	map.img.m = Img.load(MapModel.getFullPath(map.graphicPath,'m')); // 8 times smaller than regular map generated by tiled
	map.imageLoaded = true;
}

MapModel.useSignInPack = function(nameList){
	for(var i in nameList){
		if(i === nameList[i].graphic){	//base map
			var width = Math.ceil(nameList[i].width/640/2)-1;	// /2 cuz x2 smaller than real. -1 cuz 0 means 1 map
			var height = Math.ceil(nameList[i].height/360/2)-1;	// /2 cuz x2 smaller than real
			MapModel(i.split('-')[0],i.split('-')[1],width,height);
		}
	}
	for(var i in nameList){
		try {
			if(!DB[i]) 
				DB[i] = Tk.deepClone(DB[nameList[i].graphic]);	//case map using graphic of other, that map isnt on client side init
			DB[i].name = nameList[i].name;
			DB[i].graphicPath = MapModel.generateGraphicPath(nameList[i].graphic);		
		}catch(err){
			ERROR(2,i,'map not found');
		}
	}
}

MapModel.generateGraphicPath = function(graphic){
	var quest = graphic.split('-')[0];
	var name = graphic.split('-')[1];
	return "quest/" + quest + "/map/" + name + "/" + name;
}	

MapModel.getCurrent = function(){
	return DB[player.map];
}

MapModel.draw = function (ctx,layer){
	var SIZEFACT = MapModel.draw.CST.sizeFact;	

	var map = MapModel.getCurrent();
	
	var IMAGERATIO = MapModel.draw.CST.imageRatio;
	var iw = CST.WIDTH / IMAGERATIO;
	var ih = CST.HEIGHT / IMAGERATIO;
	var mapAmount = IMAGERATIO/2+1;		//ex: ratio=4 => 2x2 maps makes whole screen => 3x3 to see everything if player is middle
	
	var startX = (player.x-CST.WIDTH/2)/SIZEFACT;		//top right of screen in map ratio
	var startY = (player.y-CST.HEIGHT/2)/SIZEFACT;
	
	var offsetX = -(startX % iw);				//offset where we need to draw first map
	var offsetY = -(startY % ih);
	
	if(startX < 0) offsetX -= iw;		//if negative, fucks the modulo
	if(startY < 0) offsetY -= ih;
	
	for(var i = 0; i < mapAmount; i++){
		for(var j = 0; j < mapAmount; j++){
			var mapX = Math.floor(startX/iw) + i;
			var mapY = Math.floor(startY/ih) + j;
			if(!map.img[layer][mapX] || !map.img[layer][mapX][mapY]) continue;
			var mapXY = map.img[layer][mapX][mapY];
			
			//problem is map not whole
			var iwResized = iw.mm(0,mapXY.width);
			var ihResized = ih.mm(0,mapXY.height);			
			
			ctx.drawImage(mapXY, 0,0,iwResized,ihResized,(offsetX + iw*i)*SIZEFACT ,(offsetY + ih*j)*SIZEFACT,iwResized*SIZEFACT,ihResized*SIZEFACT);
		}
	}
	
}

MapModel.draw.CST = {
	sizeFact:2,		//enlarge the map image by this factor
	imageRatio:2  	//basically 1280 / size of 1 image
}

})();














