// Global variables
let picker = document.getElementById('picker');
let pickerfolder = document.getElementById('pickerfolder');
let listing = document.getElementById('listing');
let box = document.getElementById('box');
let elem = document.getElementById("myBar");
let loader = document.getElementById("loader");
let counter = 1;
let total = 0;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
let csrftoken = getCookie('csrftoken');
// const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

// On button input change (picker), process it
picker.addEventListener('change', e => {
    loader.style.display = 'inline'
    for (var i = 0; i < picker.files.length; i++) {

        var file = picker.files[i];
        if (file.webkitRelativePath.length <= 1){
            sendFile(file, file.name);
        }else{
            sendFile(file, file.webkitRelativePath);
        }
        setTimeout(function() {
            loader.style.display = 'none'
            location.reload();   
        }, 50); 
    }
});

pickerfolder.addEventListener('change', e => {
    loader.style.display = 'inline'
    for (var i = 0; i < pickerfolder.files.length; i++) {
        
        var file = pickerfolder.files[i];
        if (file.webkitRelativePath.length <= 1){
            sendFile(file, file.name);
        }else{
            sendFile(file, file.webkitRelativePath);
        }
        setTimeout(function() {
            loader.style.display = 'none'
            location.reload();   
        }, 50);
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

    request.setRequestHeader("X-CSRFToken", csrftoken);
    request.send(formData);
};


function delete_file(element) {
    const url = element.querySelector("p").innerHTML;

    if (confirm("Press a button!")) {
        var request = new XMLHttpRequest();
        request.open("GET", url);
        request.send()

        setTimeout(function() {
            location.reload()
        }, 40);
    } else {
        
    }
}