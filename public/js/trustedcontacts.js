let contacts = [];

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('continue')) {
        const contact_name_1 = document.querySelector('[name="name1"]').value;
        const contact_email_1 = document.querySelector('[name="email1"]').value;
        const contact_name_2 = document.querySelector('[name="name2"]').value;
        const contact_email_2 = document.querySelector('[name="email2"]').value;
        const contact_name_3 = document.querySelector('[name="name3"]').value;
        const contact_email_3 = document.querySelector('[name="email3"]').value;
        contacts.push({ name: contact_name_1, email: contact_email_1 });
        contacts.push({ name: contact_name_2, email: contact_email_2 });
        contacts.push({ name: contact_name_3, email: contact_email_3 });
        let url = '/api/user/contacts';
        fetch(`${url}?token=${localStorage.getItem('accessToken')}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ contacts: contacts }),
        })
        .then(async (response) => {
            const data = await response.json();
            if (data.success === true) {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/contacts'
            }
        })
        .catch((err) => {console.log(err)});
    }
})

window.onload = () => {
    if (localStorage.getItem('accessToken')) {
        let url = '/api/user';
        fetch(`${url}?token=${localStorage.getItem('accessToken')}`).then(res => res.json()).then(data => {
            if (data.verified === true && data.sports.length > 0) {
                window.location.href = '/dashboard';
            } else {
                document.getElementsByTagName('body')[0].style.display = 'block'
            }
        }).catch(err => console.log(err));
    } else {
        window.location.href = '/register';
    }
}