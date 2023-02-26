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
        localStorage.setItem('distanceFromLatestStridee', distanceInt);
        if (distanceInt < 1) {
            alert(`A new stride is available!`);
            window.location.href = '/stridees';
        }
    })
    .catch(err => console.log(err));

})

let distanceInt = 0;
let duration = "";

window.onload = () => {
    fetch(`/api/user/strides/?token=${localStorage.getItem("accessToken")}`).then(res => res.json()).then(data => {
        data.forEach(stride => {
            let url = `https://api.radar.io/v1/route/distance?origin=${stride.start_location[1]},${stride.start_location[0]}&destination=${stride.end_location[0].split(",")[1]},${stride.end_location[0].split(",")[0]}&modes=foot&units=imperial`;
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'prj_live_sk_023b2379b86ae218901dd83336e69dce2f8276ac'
                },
            })
            .then(res => res.json())
            .then(data => {
                duration = data.routes.foot.duration.text;
                distanceInt = Number(localStorage.getItem('distanceFromLatestStridee'));
                const rating = stride.stridee.rating;
                let ratingStarsHTML = ''
                for (let i = 1; i < 6; i++) {
                    if (i <= rating) {
                        ratingStarsHTML += `<img src="/assets/filled-star.svg" width="35" height="35">`;
                    } else {
                        ratingStarsHTML += `<img src="/assets/unfilled-star.svg" width="35" height="35">`;
                    }
                }
                const cardHTML = `
                <div class="act-card">
                <div class="inline">
                    <div class="left" style="width: 60%">
                        <h1>${stride.stridee.name}</h1>
                        <p class="sport">
                            ${ratingStarsHTML}
                        </p>
                        <br><br>
                        <p class="time">${distanceInt} miles away | ${duration} trip</p>
                        <br>
                        <p class="time"><span style="font-weight: bold">Destination:</span> ${stride.end_location_name}</p>
                    </div>
                    <div class="right" style="width: 40%">
                        <div class="inline-respond-buttons" >
                            <div class="tick" id="${stride._id}">
                                <img src="https://cdn.discordapp.com/attachments/766636913343463454/1041205273022439424/image.png">
                            </div>
                            <div class="cross" id="${stride._id}">
                                <img src="https://cdn.discordapp.com/attachments/766636913343463454/1041205360259772436/image.png">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
                document.getElementById('act-cards').innerHTML += cardHTML;
            })
            .catch(err => console.log(err));
        })
    })
}

window.addEventListener('click', (e) => {
    const element = e.target.parentElement;
    if (element.classList.contains('tick')) {
        let id = element.id;
        fetch(`/api/user/request-stridee/?stride=${id}&distance=${distanceInt}&duration=${duration}&token=${localStorage.getItem("accessToken")}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('strideID', id);
                window.location.href = '/session';
            }
        })
    } else if (element.classList.contains('cross')) {
        let id = element.id;
        const cards = document.getElementsByClassName('act-card');
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].children[0].children[1].children[0].children[0].id === id) {
                cards[i].remove();
            }
        }
    }
})