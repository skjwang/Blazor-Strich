/**
 * Add detected code to DOM
 */

var defaultConfig4BCR = {
    selector: '#scanner',
    engine: {
        symbologies: ['databar', 'databar-exp', 'code128', 'code39', 'code93', 'i25', 'codabar',
            'ean13', 'ean8', 'upca', 'upce', 'i25', 'qr'],
        //symbologies: ['upca'],
        numScanlines: 15,
        minScanlinesNeeded: 2,
        duplicateInterval: 1500
    },
    locator: {
        regionOfInterest: {
            left: 0.05, right: 0.05, top: 0.3, bottom: 0.3 // narrow RoE for 1D
        }
    },
    frameSource: {
        resolution: 'full-hd'
    },
    overlay: {
        showCameraSelector: true,
        showFlashlight: true,
        showDetections: false
    },
    feedback: {
        audio: true,
        vibration: true
    }
};


export function initializeSDK() {     
    const license_key =  "<ADD LICENSE KEY HERE>"
    import("https://cdn.jsdelivr.net/npm/@pixelverse/strichjs-sdk@1.4.4")
        .then((module1) => {module1.StrichSDK.initialize(license_key)})
        .then(() => {
            alert("SDK initialized successfully, ready to scan.");
        })
        .catch(err => {
            alert('SDK initialization failed: ' + err.message);
        });;
}

function get_detection(barcodeReader, detections) {
    var message;
    message = detections[0].data;    
    console.log("the code: " + message);
    stopScanning(barcodeReader, message);
    return message;
}
export function startBarcodeScan(dotNetHelper1) {    
    var msg_return = "start_scanning";
    var barcodeReader = null;
    var BCR = null;

    if (barcodeReader) {
        stopScanning(barcodeReader, null);
    } else {
        import("https://cdn.jsdelivr.net/npm/@pixelverse/strichjs-sdk@1.4.4")
            .then((module2) => {                
                BCR = new module2.BarcodeReader(defaultConfig4BCR);                
                BCR.detected = async (detections) => {
                    msg_return = await get_detection(barcodeReader, detections);
                    await dotNetHelper1.invokeMethodAsync('UpdateCodeAsync', msg_return);
                };
                BCR.initialize().then(br => {
                    barcodeReader = br;
                    br.start();
                }).catch(() => {
                    resolve("Scanning failed!");
                });               
            });                                    
    }
}

function stopScanning(barcodeReader, value) {
    // destroy the barcodeReader in any case
    barcodeReader.stop().then(() => {
        barcodeReader.destroy();
    }).then(() => {
        barcodeReader = null;
    });
}

