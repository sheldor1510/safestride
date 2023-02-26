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

window.onload = () => {
    const strideID = localStorage.getItem('strideID');
    fetch(`/api/user/stride/?stride_id=${strideID}`).then(res => res.json()).then(data => {
        data.requests.forEach(request => {
            const rating = request.rating;
            let ratingStarsHTML = ''
            for (let i = 1; i < 6; i++) {
                if (i <= rating) {
                    ratingStarsHTML += `<img src="/assets/filled-star.svg" width="35" height="35">`;
                } else {
                    ratingStarsHTML += `<img src="/assets/unfilled-star.svg" width="35" height="35">`;
                }
            }
            const card = `<div class="act-card">
            <div class="inline">
                <div class="left" style="width: 55%">
                    <h1>${request.name}</h1>
                    <p class="sport">
                        ${ratingStarsHTML}
                    </p>
                    <br><br>
                    <p class="time">${request.distance} miles away</p>
                </div>
                <div class="right" style="width: 20%">
                    <div class="inline-respond-buttons" >
                        <div class="tick" id="${request.uid}">
                            <img src="https://cdn.discordapp.com/attachments/766636913343463454/1041205273022439424/image.png">
                        </div>
                    </div>
                </div>
            </div>
        </div>`
            document.getElementById('act-cards').innerHTML += card;
        });
    })
}

window.addEventListener('click', (e) => {
    const element = e.target.parentElement;
    if (element.classList.contains('tick')) {
        let id = element.id;
        fetch(`/api/user/accept-strider/?stride=${localStorage.getItem('strideID')}&strider=${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/session';
            }
        })
    }
})