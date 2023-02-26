const socket = io("/");

socket.on("connect", () => {
    console.log(socket.id);
    fetch(`/api/user/socket?token=${localStorage.getItem('accessToken')}&socket_id=${socket.id}`).then(res => {});
});

socket.on("notif", (info) => {
    console.log(info);
    const currentPosition = localStorage.getItem('location').split(',');
    const destination = { lat: info.strideeLocation.split(",")[1]-0.01, lng: info.strideeLocation.split(",")[0] };
    let url = `https://api.radar.io/v1/route/distance?origin=${currentPosition[1]},${currentPosition[0]}&destination=${destination.lat},${destination.lng}&modes=foot&units=imperial`;
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'prj_live_sk_023b2379b86ae218901dd83336e69dce2f8276ac'
        },
    })
    .then(res => res.json())
    .then(data => {
        const distance = data.routes.foot.distance.text;
        const duration = data.routes.foot.duration.text;
        const distanceInt = Number(distance.split(" ")[0]);
        if (distanceInt < 1) {
            alert(`A new stride is available!`);
            window.location.href = '/stridees';
        }
    })
    .catch(err => console.log(err));
})

const myAPIKey = 'c5b06da89083429ea5cdd1a2ae7e3559'
const mapboxApiKey = 'pk.eyJ1Ijoic3VtcnVkaGlqYWRoYXYiLCJhIjoiY2xhZTlhMW95MG8wczN3cW53dXJoOXp6aCJ9.S7cAxzYiovXR03-anvd4lQ';

const autocompleteInput = new autocomplete.GeocoderAutocomplete(
    document.getElementById("autocomplete"), 
    myAPIKey
);

document.getElementById("autocomplete").addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
        const searchQuery = document.getElementsByClassName("geoapify-autocomplete-input")[0].value
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxApiKey}`)
        .then(res => res.json())
        .then(data => {
            let locations = data.features;
            locations = locations.slice(0, 2);
            document.getElementById('search-results').innerHTML = '';
            for (let i = 0; i < locations.length; i++) {
                const address = locations[i].properties.address.substring(0, 30)
                document.getElementById('search-results').innerHTML += `
                    <div class="search-result">
                        <div class="inline">
                            <div class="right">
                                <img src="https://cdn.discordapp.com/attachments/766636913343463454/1078838707458670642/image.png" alt="placeholder" class="search-icon">
                            </div>
                            <div class="left">
                                <h1 class="search-text">${locations[i].text}</h1>
                                <p>${address}</p>
                            </div>
                            <input type="hidden" name="lat" value="${locations[i].center[0]}">
                            <input type="hidden" name="lng" value="${locations[i].center[1]}">
                        </div>
                    </div>
                `
            }
        })
        .catch(err => console.log(err))
    }
})

mapboxgl.accessToken = mapboxApiKey;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-72.52582468991241, 42.39107348551288],
    zoom: 15
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('search-result') || e.target.classList.contains('search-text') || e.target.classList.contains('search-icon')) {
        const name = e.target.innerText;
        console.log(name);
        const items = document.getElementsByClassName('search-result')
        for (let i = 0; i < items.length; i++) {
            if (items[i].getElementsByClassName('search-text')[0].innerText == name) {
                const lat = items[i].getElementsByTagName('input')[0].value;
                const lng = items[i].getElementsByTagName('input')[1].value;
                const destination = [lat, lng];
                fetch('/api/user/start?token=' + localStorage.getItem('accessToken') + '&destination=' + destination + '&destination_name=' + name).then(res => res.json()).then(data => {
                    if (data.success) {
                        localStorage.setItem('strideID', data.stride_id);
                        socket.emit('notif', { userId: localStorage.getItem('accessToken'), strideeLocation: localStorage.getItem('location') });
                        window.location.href = '/striders';
                    }
                })
            }
        }
    }
})

window.onload = () => {
    document.getElementsByClassName("geoapify-autocomplete-input")[0].placeholder  = "🔎  Where are you going?"
    let url = `/api/user/dash?token=${localStorage.getItem('accessToken')}`
    fetch(url).then(res => res.json()).then(data => {
        let name = data.name;
        let rating = data.rating;
        let location = data.location;
        document.getElementById("user-name").innerText = name.split(" ")[0];
        document.getElementById("user-rating").innerText = rating;
        
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
}