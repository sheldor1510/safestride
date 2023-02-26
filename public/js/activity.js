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

window.onload = () => {}

window.addEventListener('click', (e) => {
    const element = e.target.parentElement;
    if (element.classList.contains('tick')) {
        let id = element.id;
        fetch(`/api/activity/update/${id}?token=${localStorage.getItem('accessToken')}&status=Accepted`).then(res => {
            window.location.href = '/activity';
        })
    } else if (element.classList.contains('cross')) {
        let id = element.id;
        fetch(`/api/activity/update/${id}?token=${localStorage.getItem('accessToken')}&status=Rejected`).then(res => {
            window.location.href = '/activity';
        })
    }
})