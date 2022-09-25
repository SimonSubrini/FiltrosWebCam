
var video;
var canvas;

var altoCamara = 720;
var anchoCamara = 720;

//Pra buscar más ejemplos de kernel's: https://en.wikipedia.org/wiki/Kernel_(image_processing)

/*var kernel=[ //Detección de bordes
    [-1,-1,-1],
    [-1, 8,-1],
    [-1,-1,-1]
]*/

var kernel=[ // Enfoque
    [ 0,-1, 0],
    [-1, 5,-1],
    [ 0,-1, 0]
]

//Sobel:
var sobelV=[ // sobel vertical
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
]

var sobelH=[ // sobel horizontal
    [-1,-2,-1],
    [ 0, 0, 0],
    [ 1, 2, 1]
]

var threshold=20; // La utilizo en sobel como el umbral minimo a representar

function MostrarCamara() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas")

    var opciones = {
        audio: false,
        video: {
            width: anchoCamara,
            height: altoCamara
        }
    }

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(opciones)
            .then(function (stream) {
                video.srcObject = stream;
                procesarCamara();
            })
            .catch(function (err) {
                console.log("Oops, hubo un error:\n", err);
            })
    } else {
        console.log("No existe la funcion getUserMedia");
    }
}

function procesarCamara() {
    var ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, anchoCamara, altoCamara, 0, 0, canvas.width, canvas.height);

    //blancoYNegro(canvas);

    var canvasRes=document.getElementById("canvasRes");

    // ------- kernel "común"
    /*
    convolucionar(canvas,canvasRes,kernel);
    */

    // ------- kernel "doble" (sobel)
    sobel(canvas,canvasRes,sobelH,sobelV);

    setTimeout(procesarCamara, 20);
}

function blancoYNegro(canvas){
    var ctx = canvas.getContext("2d");

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pixeles = imgData.data;

    for (var p=0; p < pixeles.length; p += 4) {
		var rojo = pixeles[p];
		var verde = pixeles[p+1];
		var azul = pixeles[p+2];
		var alpha = pixeles[p+3];

        var gris=(rojo+verde+azul)/3;

        pixeles[p]=gris;
        pixeles[p+1]=gris;
        pixeles[p+2]=gris;
        pixeles[p+3]=255;
    }
    ctx.putImageData(imgData,0,0);

}

function convolucionar(canvasFuente,canvasDestino,kernel){
    var ctxFuente=canvasFuente.getContext("2d");
    var imgDataFuente=ctxFuente.getImageData(0,0,canvasFuente.width,canvasFuente.height);
    var pixelesFuente=imgDataFuente.data;
    
    canvasDestino.width=canvasFuente.width;
    canvasDestino.height=canvasFuente.height;

    var ctxDestino=canvasDestino.getContext("2d");
    var imgDataDestino=ctxDestino.getImageData(0,0,canvasDestino.width,canvasDestino.height);
    var pixelesDestino=imgDataDestino.data;
    

    for (var y=1; y < canvasFuente.height-1; y++) {
        for(var x=1;x<canvasFuente.width-1;x++){
            //var idx=4*(y*canvasFuente.width+x);
            var idx;
            var resultadoCasilla=0;
            for (var i=0;i<3;i++){
                for (var j=0;j<3;j++){
                    idx=4*((y-i-1)*canvasFuente.width+(x-i-1));
                    resultadoCasilla+=kernel[i][j]*pixelesFuente[idx];
                }
            }

            pixelesDestino[idx]=resultadoCasilla;
            pixelesDestino[idx+1]=resultadoCasilla;
            pixelesDestino[idx+2]=resultadoCasilla;
            pixelesDestino[idx+3]=255;
        }
    }

    ctxDestino.putImageData(imgDataDestino,0,0);
}

function sobel(canvasFuente,canvasDestino,sobelH,sobelV){
    var ctxFuente=canvasFuente.getContext("2d");
    var imgDataFuente=ctxFuente.getImageData(0,0,canvasFuente.width,canvasFuente.height);
    var pixelesFuente=imgDataFuente.data;
    
    canvasDestino.width=canvasFuente.width;
    canvasDestino.height=canvasFuente.height;

    var ctxDestino=canvasDestino.getContext("2d");
    var imgDataDestino=ctxDestino.getImageData(0,0,canvasDestino.width,canvasDestino.height);
    var pixelesDestino=imgDataDestino.data;

    for (var y=1; y < canvasFuente.height-1; y++) {
        for(var x=1;x<canvasFuente.width-1;x++){
            var idx;
            var resultadoCasillaH=0;
            var resultadoCasillaV=0;
            var resultadoCasilla=0;
            for (var i=0;i<3;i++){
                for (var j=0;j<3;j++){
                    idx=4*((y-i-1)*canvasFuente.width+(x-i-1));
                    resultadoCasillaH+=sobelH[i][j]*pixelesFuente[idx];
                    resultadoCasillaV+=sobelV[i][j]*pixelesFuente[idx];
                }
            }

            resultadoCasilla=Math.sqrt(Math.pow(resultadoCasillaH,2)+Math.pow(resultadoCasillaV,2));

            resultadoCasilla=resultadoCasilla>threshold?resultadoCasilla:0;

            pixelesDestino[idx]=resultadoCasilla;
            pixelesDestino[idx+1]=resultadoCasilla;
            pixelesDestino[idx+2]=resultadoCasilla;
            pixelesDestino[idx+3]=255;
        }
    }


    
    ctxDestino.putImageData(imgDataDestino,0,0);
}