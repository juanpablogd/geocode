var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var moment = require('moment');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});
function tituloX(fila){
	var tx = undefined;
	var titulos = Object.keys(fila);
	for(var i= 0;i<titulos.length;i++){	//console.log(titulos[i]);
		var t = titulos[i].toString().toUpperCase().trim();
		if(t=="X"){ tx = titulos[i];break; }
		if(t=="CX"){ tx = titulos[i];break; }
		if(t=="LON"){ tx = titulos[i];break; }
		if(t=="LONG"){ tx = titulos[i];break; }
		if(t=="LONGITUD"){ tx = titulos[i];break; }
	}
	if(tx == undefined){	//console.log("Revisa valores");
		for(var i= 0;i<titulos.length;i++){
			var t = fila[titulos[i]].toString().toUpperCase().trim();
			if(t=="X"){ tx = titulos[i];break; }
			if(t=="CX"){ tx = titulos[i];break; }
			if(t=="LON"){ tx = titulos[i];break; }
			if(t=="LONG"){ tx = titulos[i];break; }
			if(t=="LONGITUD"){ tx = titulos[i];break; }
		}
	}
	return tx;
}
function tituloY(fila){
	var ty = undefined;
	var titulos = Object.keys(fila);
	for(var i= 0;i<titulos.length;i++){
		var v = titulos[i].toString().toUpperCase().trim();
		if(v=="Y"){ ty = titulos[i];break; }
		if(v=="CY"){ ty = titulos[i];break; }
		if(v=="LAT"){ ty = titulos[i];break; }
		if(v=="LATITUD"){ ty = titulos[i];break; }
	}
	if(ty == undefined){
		for(var i= 0;i<titulos.length;i++){
			var v = fila[titulos[i]].toString().toUpperCase().trim();
			if(v=="Y"){ ty = titulos[i];break; }
			if(v=="CY"){ ty = titulos[i];break; }
			if(v=="LAT"){ ty = titulos[i];break; }
			if(v=="LATITUD"){ ty = titulos[i];break; }
		}
	}
	return ty;
}

var data={
	leerArchivo:function(rutaArchivo){
		console.log(rutaArchivo);
		var converter = new Converter({
		  constructResult:true,
		  delimiter:';',
		  ignoreEmpty:true,
		  checkColumn:true,
		  noheader:false
		});
		converter.fromFile(rutaArchivo,function(err,jsonArray){
		   var contador=0;		//console.log(jsonArray);
		   if (jsonArray!=undefined){
			   if(jsonArray.length>0){
			   		var BreakException = {};
			   		var headerX,headerY;
			   		try{
						jsonArray.forEach(function(fila) {
							if(contador==0){	console.log(fila);
								headerX=tituloX(fila);	console.log("ColumnaX: "+headerX);
								headerY=tituloY(fila);	console.log("ColumnaY: "+headerY);
								//if(fila.X!==undefined) headerX = "X";if(fila.x!==undefined) headerX = "x";
								//if(fila.Y!==undefined) headerY = "Y";if(fila.y!==undefined) headerY = "y";
							}else{
								if(headerX == undefined || headerY == undefined) throw BreakException;
							}
							
							//console.log(fila);
							contador++;
						});
					} catch(e){
						console.log(e);
						console.log("Archivo No Valido");
						if(e !== BreakException) throw e;
					}
					console.log(moment().format('h:mm:s:SSSS'));
					console.log("------------------------------------------------");
			   	}
			}else{
				console.log("No se pudo leer el archivo");
			}
		});
	}
};

app.post('/upload', function(req, res){

  // create an incoming form object 
  var form = new formidable.IncomingForm();
  var rutaArchivo,nombreArchivo;

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    nombreArchivo=file.name;
    rutaArchivo = path.join(form.uploadDir, nombreArchivo);
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
	res.end(nombreArchivo);
	console.log(moment().format('h:mm:s:SSSS'));
	setTimeout(function(){ data.leerArchivo(rutaArchivo); }, 200);
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
