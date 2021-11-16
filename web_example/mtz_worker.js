var CCP4Module;

importScripts('web_example.js');

createCCP4Module({print(t){postMessage(["output",t])},printErr(t){postMessage(["output",t]);}})
    .then(function(CCP4Mod) {
             CCP4Module = CCP4Mod;
            })
.catch((e) => {
        console.log("CCP4 problem :(");
        console.log(e);
        });

onmessage = function(e) {
    var byteCharacters = atob(e.data[0]);
    var selectedFileName = e.data[1];

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    try {
        CCP4Module.FS_createDataFile(".", selectedFileName, byteArray, true, true);
    } catch(e) {
    }

    var result = CCP4Module.clipper_example(selectedFileName);
    console.log("In the worker...");
    console.log(result);
    console.log(result.cell());
    console.log(result.cell().a());
    CCP4Module.printMapStats(result);
    postMessage(["result",result]);
}
