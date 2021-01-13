// Global variables
let picker = document.getElementById('picker');
let listing = document.getElementById('listing');
let box = document.getElementById('box');
let elem = document.getElementById("myBar");
let loader = document.getElementById("loader");
let counter = 1;
let total = 0;

// On button input change (picker), process it
picker.addEventListener('change', e => {


    for (var i = 0; i < picker.files.length; i++) {
        var file = picker.files[i];
        console.log(file)
        if (file.webkitRelativePath.length <= 1){
            sendFile(file, file.name);
        }else{
            sendFile(file, file.webkitRelativePath);
        }   
    }
});

// Function to send a file, call PHP backend 
sendFile = function(file, path) {

    var item = document.createElement('li');
    var formData = new FormData();
    var request = new XMLHttpRequest();

    // Set post variables 
    formData.append('path', path); // String of local file's path 
    formData.append('file', file); // One object file

    // Do request
    request.open("POST", 'upload/');
    request.send(formData);

};