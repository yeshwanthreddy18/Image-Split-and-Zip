function importImages(){

    var fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('multiple', 'multiple');
    var zip=new JSZip();
    var promises = [];
    var imageFILES={};

    fileSelector.addEventListener('change', function(event) {

        console.log(event.target.files);
        var numberOfFiles=event.target.files.length;
        var TotalFiles=event.target.files;

        var cvs = document.createElement('canvas');
        var imgCount=0;
        repeat();
        function repeat() {

            var imgFile=TotalFiles[imgCount];

            var index = imgFile.name.lastIndexOf('.');
            var imageName = imgFile.name.slice(0, index);
            var extension=imgFile.name.slice(index+1);
            imageFILES[imageName]=[];
            imageFILES[imageName][0]=extension;

            var image = new Image();
            var objectURL = window.URL.createObjectURL(imgFile);

            image.src = objectURL;
            image.onload = function () {
                var ctx = cvs.getContext("2d");
                var tileX = 0;
                cvs.height = image.naturalHeight/2;
                var canvasWidth = parseInt(image.naturalWidth / 6);
                var newWidth, newHeight;
                newHeight = image.naturalHeight;
                newWidth = canvasWidth;

                for (var i = 0; i < 6; i++) {

                    if (i == 5) {
                        newWidth = image.naturalWidth - (5 * canvasWidth);
                    }
                    cvs.width=newWidth/2;

                    ctx.drawImage(image, tileX, 0, canvasWidth, image.naturalHeight, 0, 0, newWidth/2, newHeight/2);
                    tileX += canvasWidth;


                    var mime_type = "image/jpeg";

                    if(extension !== "undefined" && extension=="png"){
                        mime_type = "image/png";
                    }

                    function getCanvasBlob(canvas,name) {

                        return new Promise(function (resolve, reject) {

                            (function(partNumber) {
                                canvas.toBlob(function (blob) {
                                    resolve(blob)
                                    blob.name = name;
                                    imageFILES[name][partNumber]=blob;
                                }, mime_type)
                            })(i+1)
                        })
                    }

                    promises.push(getCanvasBlob(cvs,imageName));
                }
                Promise.all(promises).then(function (values) {
                    

                }).then(function (values) {
                    if(imgCount<numberOfFiles-1){
                        ++imgCount;
                        repeat();
                    }
                    else {
                        for (var key in imageFILES){
                            var j=0;
                                for(var parts=1;parts< imageFILES[key].length;parts++){
                                zip.file(key + "/" + j +"." +imageFILES[key][0],imageFILES[key][parts] );
                                j++;
                                }
                            }
                        console.log(imageFILES);
                        zip.generateAsync({type: "blob"}).then(function (base64) {
                            var link = document.createElement( 'a' );
                            link.style.display = 'none';
                            document.body.appendChild( link );
                            var blob = new Blob( [ base64 ], { type: 'application/zip' } );
                            link.href = window.URL.createObjectURL( blob );
                            link.download = 'data';
                            link.click();
                            window.URL.revokeObjectURL(base64);
                        }, function (err) {
                            console.log(err)
                        });
                    }
                })
            }
        }
    });
    fileSelector.click();
}