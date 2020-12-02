const content = `
    /**
     * Crop signature canvas to only contain the signature and no whitespace.
     *
     * @since 1.0.0
     */
    var cropSignatureCanvas = function(canvas) {
  
        // First duplicate the canvas to not alter the original
        var croppedCanvas = document.createElement('canvas'),
            croppedCtx    = croppedCanvas.getContext('2d');
  
            croppedCanvas.width  = canvas.width;
            croppedCanvas.height = canvas.height;
            croppedCtx.drawImage(canvas, 0, 0);
  
        // Next do the actual cropping
        var w         = croppedCanvas.width,
            h         = croppedCanvas.height,
            pix       = {x:[], y:[]},
            imageData = croppedCtx.getImageData(0,0,croppedCanvas.width,croppedCanvas.height),
            x, y, index;
  
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                index = (y * w + x) * 4;
                if (imageData.data[index+3] > 0) {
                    pix.x.push(x);
                    pix.y.push(y);
  
                }
            }
        }
        pix.x.sort(function(a,b){return a-b});
        pix.y.sort(function(a,b){return a-b});
        var n = pix.x.length-1;
  
        w = pix.x[n] - pix.x[0];
        h = pix.y[n] - pix.y[0];
        var cut = croppedCtx.getImageData(pix.x[0], pix.y[0], w, h);
  
        croppedCanvas.width = w;
        croppedCanvas.height = h;
        croppedCtx.putImageData(cut, 0, 0);
  
        return croppedCanvas.toDataURL();
    };

    var canvas = document.querySelector("canvas"),
        signaturePad;
    
    // Adjust canvas coordinate space taking into account pixel ratio,
    // to make it look crisp on mobile devices.
    // This also causes canvas to be cleared.
    function resizeCanvas() {
        // When zoomed out to less than 100%, for some very strange reason,
        // some browsers report devicePixelRatio as less than 1
        // and only part of the canvas is cleared then.
        var context = canvas.getContext("2d"); //context.getImageData(0,0,canvas.width,canvas.height)
        var imgData = signaturePad ? signaturePad.toData() : null;
        var ratio =  1;
        
        var bodyWidth = document.body.clientWidth;
        var bodyHeight = document.body.clientHeight;
        
        if(!bodyWidth) {
          bodyWidth = window.innerWidth;
        }
        if(!bodyHeight) {
          bodyHeight = window.innerHeight;
        }
        
        canvas.width = bodyWidth * ratio;
        canvas.height = bodyHeight * ratio;
        context.scale(ratio, ratio);
        // context.putImageData(imgData,0,0);
        imgData && signaturePad.fromData(imgData);
    }
    
    window.onresize = resizeCanvas;
    resizeCanvas();
    
    signaturePad = new SignaturePad(canvas, {
        onBegin: () => window.ReactNativeWebView.postMessage("BEGIN"),
        onEnd: () => window.ReactNativeWebView.postMessage("END"),
        minWidth: 4,
        maxWidth: 10,
        penColor: '<%penColor%>',
        backgroundColor: '<%backgroundColor%>',
        dotSize: <%dotSize%>,
        minWidth: <%minWidth%>,
    });

    function clearSignature (event) {
        signaturePad.clear();
        window.ReactNativeWebView.postMessage("CLEAR");
    }

    var autoClear = <%autoClear%>;

    var dataURL = '<%dataURL%>';

    if (dataURL) {
        signaturePad.fromDataURL(dataURL);
    }

    function readSignature()  {
        if (signaturePad.isEmpty()) {
            window.ReactNativeWebView.postMessage("EMPTY");
        } else {
            var url = cropSignatureCanvas(canvas);
            window.ReactNativeWebView.postMessage(url);
            if (autoClear) {
                signaturePad.clear();
            }
        }
    }  
`;

export default content;
