const socket = io("/");

socket.on("connect", () => {
    console.log(socket.id);
    fetch(`/api/user/socket?token=${localStorage.getItem('accessToken')}&socket_id=${socket.id}`).then(res => {});
});

socket.on("stride", (data) => {
    console.log(data);
    if (data.stridee_id == localStorage.getItem('accessToken')) {
        console.log(data.end);
        if (data.end == true) {
            localStorage.setItem('ongoingStride', false);
            window.location.href = '/review';
        } else {
            localStorage.setItem('ongoingStride', true);
            window.location.href = '/session';
        }
    }
})

const mapboxApiKey = 'pk.eyJ1Ijoic3VtcnVkaGlqYWRoYXYiLCJhIjoiY2xhZTlhMW95MG8wczN3cW53dXJoOXp6aCJ9.S7cAxzYiovXR03-anvd4lQ';

mapboxgl.accessToken = mapboxApiKey;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-72.52582468991241, 42.39107348551288],
    zoom: 15
});

let otherPersonID = ""
let OTP = "";

const refreshOtherPersonsLocation = (paramID) => {
    let id = ""
    if (paramID == false) {
        id = otherPersonID;
    } else {
        id = paramID;
        otherPersonID = paramID;
    }
    let url = `/api/user/dash?token=${id}`
    fetch(url).then(res => res.json()).then(data => {
        let location = data.location;
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = `80px`;
        el.style.backgroundImage = `url(https://cdn.discordapp.com/attachments/766636913343463454/1079090561732067388/image.png)`;
        el.style.height = `80px`;
        el.style.backgroundSize = '100%';
        
        new mapboxgl.Marker(el)
                .setLngLat(location)
                .addTo(map);

        map.flyTo({
            center: [-72.52582468991241, 42.38108348551288],
            zoom: 15
        })
    })
}

window.addEventListener('click', (e) => {
    if (e.target.id == "refresh") {
        refreshOtherPersonsLocation(false);
    } else if (e.target.id == "end-trip") {
        localStorage.setItem('ongoingStride', false);
        fetch('/api/user/stride/end?stride=' + localStorage.getItem('strideID') + '&token=' + localStorage.getItem('accessToken')).then(res => res.json()).then(data => {
            if (data.success == true) {
                socket.emit("stride", {
                    stridee_id: data.otherperson,
                    end: true
                });
                window.location.href = '/review';
            }
        })
    }
})

window.addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
        if (e.target.id == "otp-token") {
            if (e.target.value == OTP) {
                alert("Success!");
                socket.emit("stride", {
                    stridee_id: otherPersonID,
                    end: false
                })
                fetch('/api/user/stride/ongoing?stride=' + localStorage.getItem('strideID') + '&otherperson=' + otherPersonID).then(res => res.json()).then(data => {
                    if (data.success == true) {
                        localStorage.setItem('ongoingStride', true);
                        window.location.href = '/session';
                    }
                });
            } else {
                alert("Wrong OTP!");
            }
        }
    }
})

window.onload = () => {
    if (localStorage.getItem('ongoingStride') == "true") {
        let strideURL = `/api/user/stride/?stride_id=${localStorage.getItem('strideID')}`;
        fetch(strideURL).then(res => res.json()).then(stride => {
            document.getElementById("card-name").style.width = '100%';
            document.getElementById("card-name").style.fontWeight = '800px';
            document.getElementById("card-name").style.fontSize = '7vw';
            document.getElementById("card-name").innerHTML = `Your stride is in progress!`;
            document.getElementById('otp-head-text').innerHTML = '';
            document.getElementById('otp-below-text').innerHTML = '';
            document.getElementById('otp').innerHTML = '';
            document.getElementById('sliding-div').innerHTML += `<a target="_blank" href="http://maps.google.com/?q=${stride.end_location[0].split(",")[1]},${stride.end_location[0].split(",")[0]}"><button class="continue" style="margin-top: -10vw">Get Directions</button></a>`
            document.getElementById('sliding-div').innerHTML += `<button class="continue" style="margin-top: 5vw; background-color: #eb5b5b;" id="end-trip">End Trip</button>`
            document.getElementById('sliding-div').style.height = '70vw'
            document.getElementsByClassName('inline')[0].style.height = '25vw'
            var start = [stride.start_location[0], stride.start_location[1]];
            var end = [stride.end_location[0].split(",")[0], stride.end_location[0].split(",")[1]];

            var startMarker = new mapboxgl.Marker().setLngLat(start).addTo(map);
            var endMarker = new mapboxgl.Marker().setLngLat(end).addTo(map);

            // add line between the two points
            var directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

            fetch(directionsRequest)
                .then(function (response) {
                return response.json();
                })
                .then(function (data) {
                var route = data.routes[0].geometry.coordinates;
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                        type: 'LineString',
                        coordinates: route
                        }
                    }
                    },
                    layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                    },
                    paint: {
                    'line-color': '#1A73E8',
                    'line-width': 10
                    }
                });
            });
        })
    } else {
        let url = `/api/user/dash?token=${localStorage.getItem('accessToken')}`
        fetch(url).then(res => res.json()).then(data => {
            let location = data.location;
            
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = `80px`;
            el.style.backgroundImage = `url(https://cdn.discordapp.com/attachments/766636913343463454/1078825981382496356/image.png)`;
            el.style.height = `80px`;
            el.style.backgroundSize = '100%';
            
            new mapboxgl.Marker(el)
                    .setLngLat(location)
                    .addTo(map);


            location[1] = location[1] - 0.0006;
            map.flyTo({
                center: location,
                zoom: 19
            })
        })
        let strideURL = `/api/user/stride/?stride_id=${localStorage.getItem('strideID')}`;
        fetch(strideURL).then(res => res.json()).then(stride => {
            if (stride.stridee_id == localStorage.getItem('accessToken')) {
                document.getElementById("card-name").innerHTML = `Your SafeStrider <span style="font-weight: 800">${stride.strider.name}</span> is on their way!`;
                document.getElementById("rating").innerHTML = "<img id='refresh' src='https://cdn.discordapp.com/attachments/766636913343463454/1079079389452574790/image.png'></img>";
                document.getElementById("otp").innerHTML = `<h1 style="font-size: 15vw; text-align: center; margin-top: -7vw;">${stride.otp_token}</h1>`;
                document.getElementById("otp-below-text").innerText = "Share this OTP with your strider";
                refreshOtherPersonsLocation(stride.strider.uid);
                OTP = stride.otp_token;
            } else if (stride.strider.uid == localStorage.getItem('accessToken')) {
                document.getElementById("card-name").innerHTML = `Your SafeStridee <span style="font-weight: 800">${stride.stridee.name}</span> is waiting for you!`;
                document.getElementById("rating").innerHTML = `<a target="_blank" href="http://maps.google.com/?q=${stride.start_location[1]},${stride.start_location[0]}"><img src='https://cdn.discordapp.com/attachments/766636913343463454/1079085929244934154/image.png'></img></a>`;
                document.getElementById("otp").innerHTML = '<div class="input"><input type="text" id="otp-token" autocomplete="disabled" placeholder="4 Digit OTP" style="text-align: center;"></div>';
                document.getElementById("otp-below-text").innerText = "Enter the Stridee's OTP";
                refreshOtherPersonsLocation(stride.stridee.uid);
                OTP = stride.otp_token;
            }
        })
    }
}