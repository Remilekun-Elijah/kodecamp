const vars = {
    name: $("#name"),
    email: $("#email"),
    occupation: $("#occupation"),
    number: $("#number"),
    password: $("#password"),
    repeatPassword: $("#repeat-password"),
    profileId: $('.profile_id'),
    accountId: $('.account_id'),
    logout: $('#logout'),
    destroy: $('#destroy'),
    avatar: $('#avatar'),
    profileImg: $('#profile-img'),
    alert: $('#alert'),
    updatedAt: $('#updated_at'),
    previewImg: $('#preview_img'),
    status: $('#status'),
};
// vars.status.fadeOut(0)
vars.avatar.on("change", async e => {
    if (e.target.files.length > 0) {
        alert('loading');
        let p = URL.createObjectURL(e.target.files[0]);
        // vars.profileImg.attr("src", p);

        const res = await upload(vars.avatar.find('input'));
        vars.profileImg.attr("src", res.img);
    }
    // file uploader
    function upload(input) {
        // instantiates the form data mechanism
        const image = new FormData();
        // attaches the input file to it
        image.append("avatar", input.prevObject[0].files[0]);
        // gets the file size
        const size = (vars.avatar.find('input').prevObject[0].files[0].size / 1000).toFixed(2) + 'KB';
        // uploads the image
        return fetch('/user/uploadPic', {
            method: 'POST',
            body: image
        }).then(res => res.json()).then(response => {
            alert('success', response.message);
            // get the image from the server response and return it with the file size 
            return { img: response.image, size };
        }).catch(err => {
            alert('error', err.message)

        });
    }
});

function alert(status, msg) {
    let color, icon, label;
    if (status == 'in progress' || status == 'loading') {
        color = 'alert-primary';
        icon = 'info-fill';
        label = 'info';
        msg = msg || 'Processing request . . .';
        vars.alert.parent().css('transform', 'translateX(49%)');
    } else if (status == 'error' || status == 'failed') {
        color = 'alert-danger';
        icon = 'exclamation-triangle-fill';
        label = 'danger';
        msg = msg || 'Failed to complete request';
        setTimeout(() => {
            vars.alert.parent().css('transform', 'translateX(100%)');
        }, 3000)
    } else if (status == 'success') {
        color = 'alert-success';
        icon = 'check-circle-fill';
        label = 'success';
        msg = msg || 'Request processed successfully';
        setTimeout(() => {
            vars.alert.parent().css('transform', 'translateX(100%)');
        }, 3000)
    } else {
        setTimeout(() => {
            vars.alert.parent().css('transform', 'translateX(100%)');
        }, 3000);
    }
    const html = `
<div class="alert ${color} d-flex align-items-center w-25" role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="${label}:"><use xlink:href="#${icon}"/></svg>
                <div>
                    ${msg}
                </div>
            </div>
`;
    vars.alert.html(html)
}

fetch('/profile', {
    method: "POST",
    headers: { 'content-type': 'application/json', 'authorization': `${localStorage.getItem('token')}` }
}).then(res => res.json()).then(response => {;
    response = response.data;
    vars.name.val(response.name);
    vars.email.val(response.email);
    vars.occupation.val(response.occupation);
    vars.number.val(response.number);
    vars.profileId.text(response.id);
    vars.accountId.text(response.accountId);
    vars.updatedAt.text(`${response.updatedAt.split('T')[0]} ${response.updatedAt.split('T')[1].split('.')[0]}`);
    vars.profileImg.attr("src", response.image);
    console.log(response.updatedAt.split('T')[0], response.updatedAt.split('T')[1].split('.')[0]);

    if (response.status == 'pending') {
        vars.status.fadeIn(300)
    }
}).catch(err => {
    console.log(err);
});