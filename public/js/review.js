let personGettingReviewed = "";
let safetyRating = 0;
let communicationRating = 0;
let recommendRating = 0;
window.onload = () => {
    fetch('/api/user/stride?stride_id=' + localStorage.getItem('strideID')).then(res => res.json()).then(stride => {
        if (stride.strider.uid == localStorage.getItem("accessToken")) {
            personGettingReviewed = stride.stridee.uid;
        } else {
            personGettingReviewed = stride.strider.uid;
        }
    })
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains("star-rating")) {
        const starclicked = Number(e.target.id);
        const stars = document.getElementsByClassName("star-rating");
        for (let i = 0; i < 5; i++) {
            if (i <= starclicked) {
                stars[i].src = "/assets/filled-star.svg";
            } else {
                stars[i].src = "/assets/unfilled-star.svg";
            }
        }
        safetyRating = starclicked + 1;
        console.log(safetyRating);
    } else if (e.target.classList.contains("comm-rating")) {
        const starclicked = Number(e.target.id);
        const stars = document.getElementsByClassName("comm-rating");
        for (let i = 0; i < 5; i++) {
            if (i <= starclicked) {
                stars[i].src = "/assets/filled-star.svg";
            } else {
                stars[i].src = "/assets/unfilled-star.svg";
            }
        }
        communicationRating = starclicked + 1;
    } else if (e.target.classList.contains("rate-rating")) {
        const starclicked = Number(e.target.id);
        const stars = document.getElementsByClassName("rate-rating");
        for (let i = 0; i < 5; i++) {
            if (i <= starclicked) {
                stars[i].src = "/assets/filled-star.svg";
            } else {
                stars[i].src = "/assets/unfilled-star.svg";
            }
        }
        recommendRating = starclicked + 1;
    } else if (e.target.id == "submit-review") {
        if (safetyRating == 0 || communicationRating == 0 || recommendRating == 0) {
            alert("Please fill out all fields");
        } else {
            const averageRating = (safetyRating + communicationRating + recommendRating) / 3;
            fetch('/api/user/review?reviewee=' + personGettingReviewed + '&rating=' + averageRating).then(res => res.json()).then(data => {
                if (data.success) {
                    window.location.href = "/dashboard";
                }
            })
        }
    }
})