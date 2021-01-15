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
    }
});
var number_requests = 0;

var formData = new FormData();
pickerfolder.addEventListener('input', e => {
    loader.style.display = 'inline'
    var local = String(document.getElementById("curr").textContent);
    var filenum = 0;

    for (var i = 0; i < pickerfolder.files.length; i++) {
        var file = pickerfolder.files[i];
        if (file.webkitRelativePath.length <= 1){
            formData.append(`path${filenum}`, file.name)
            formData.append(`file${filenum}`, file)  
        }else{
            formData.append(`path${filenum}`, file.webkitRelativePath)
            formData.append(`file${filenum}`, file)
        }
        filenum ++
        if (i % 20 === 0){
            make_req(formData, local);
            formData = new FormData();
            filenum = 0;
            number_requests ++
        }
    }
    if (i % 20 !== 0){
        make_req(formData, local);
        formData = new FormData();
    }
});

function make_req(formData, local){
    var request = new XMLHttpRequest();

    var string = '';
    for (var i = 0; i < local.length; i++){
        string += local.substring(i,i+1)
    }

    formData.append('local', string)     

    request.open("POST", 'multiple_upload/');
    request.setRequestHeader("X-CSRFToken", csrftoken);

    setTimeout(function() {
            request.send(formData);
    }, 1000);
    request.onload = reqListener;
}

function reqListener () {
    console.log(number_requests)
    number_requests = number_requests - 1;
    if (number_requests < 1){
        number_requests = 0;
    }

    if (number_requests === 0){
        setTimeout(function() {
        loader.style.display = 'none'
        location.reload()
    }, 1500);
    }
};

// Function to send a file, call PHP backend 
function sendFile(file, path) {
    var string = '';
    for (var i = 0; i < local.length; i++){
        string += local.substring(i,i+1)
    }


    var formData = new FormData();
    var request = new XMLHttpRequest();

    // Set post variables 
    formData.append('local', string); // String of local file's path
    formData.append('path', path); // String of local file's path 
    formData.append('file', file); // One object file

    // Do request
    request.open("POST", 'upload/');

    request.setRequestHeader("X-CSRFToken", csrftoken);
    console.log('send')

    request.send(formData);

    request.onload = reqListener;
};


function delete_file(element) {
    loader.style.display = 'inline'
    const url = element.querySelector("p").innerHTML;

    if (confirm("Delete?")) {
        var request = new XMLHttpRequest();
        request.open("GET", url);
        request.send()

        request.onload = reqListener;
    } else {
        
    }
}


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(async function(cachedUrls) {
        const cacheKeys = Array.from(urlsToCacheKeys.values());
        const chunckSize = 20;
        const cacheKeysChunks = new Array(Math.ceil(cacheKeys.length / chunckSize)).fill().map(_ => {
          return cacheKeys.splice(0, chunckSize);
        });
        for (let cacheKeys of cacheKeysChunks) {
          await Promise.all(
            cacheKeys.map(function(cacheKey) {
              // If we don't have a key matching url in the cache already, add it.
              if (!cachedUrls.has(cacheKey)) {
                var request = new Request(cacheKey, {credentials: 'same-origin'});
                return fetch(request).then(function(response) {
                  // Bail out of installation unless we get back a 200 OK for
                  // every request.
                  if (!response.ok) {
                    throw new Error('Request for ' + cacheKey + ' returned a ' +
                      'response with status ' + response.status);
                  }

                  return cleanResponse(response).then(function(responseToCache) {
                    return cache.put(cacheKey, responseToCache);
                  });
                });
              }
            })
          );
        }
      });
    }).then(function() {

      // Force the SW to transition from installing -> active state
      return self.skipWaiting();

    })
  );
});