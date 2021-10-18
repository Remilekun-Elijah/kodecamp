// jshint esversion:8
const forms = {
    login: $("#login form"),
    register: $("#register form")
};
$("#register form p>a").click(e => {
    $("#register").fadeOut(300, () => {
        forms.login.parent().removeClass("d-none");
        $("#login").fadeIn(400);
        forms.register.parent().addClass("d-none");
    })
    $("#noUser").text("");
});

const { login, register } = forms;

login.find('a').click(e => {
    login.parent().fadeOut(300, () => {
        register.parent().removeClass("d-none");
        register.parent().fadeIn(400);
        login.parent().addClass("d-none");
    });
    $("#noUser").text("");
});


const fmt1 = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
    fmt2 = /[a-zA-Z0-9]/;
register[0].password.addEventListener("keyup", e => {

    if (e.target.value.length > 5 && fmt2.test(e.target.value)) {

        $("#infoMsg").removeClass("text-danger").addClass("text-warning");
        $(".good").addClass("bg-danger");
        $(".better").addClass("bg-warning");
        $(".best").removeClass("bg-success");
        $("#infoMsg").text("Good");


        if (fmt1.test(e.target.value) === true) {
            $("#infoMsg").removeClass("text-warning").addClass("text-success");
            $(".best").addClass("bg-success");
            $("#infoMsg").text("Excellent");
            $(e.target).removeClass("border-danger").addClass("border-success");
        }

    } else {
        $(".better").removeClass("bg-warning");
        $(".best").removeClass("bg-success");
        $("#infoMsg").addClass("text-danger").removeClass("text-success");
        $(".good").addClass("bg-danger");
        $("#infoMsg").text("Poor");
        $(e.target).addClass("border-danger")
    }

    // if confirm password is not empty
    if (register[0].Cpassword.value != '') {
        // and the password matched
        if (e.target.value === register[0].Cpassword.value) {

            // remove the red border
            $(register[0].Cpassword).removeClass("border-danger");
            // hide error message
            $("#errMsg").text("");
            // enable submit button
            register[0].submit.disabled = false;
        } else {
            // paint border red
            $(register[0].Cpassword).addClass("border-danger");
            //  show error message
            $("#errMsg").text("Password doesn't match!");
            // disable submit button
            register[0].submit.disabled = true;
        }
    }
});

register[0].Cpassword.addEventListener("keyup", e => {
    if (register[0].password.value != '') {
        // console.log(e.target.value.indexOf(pass));
        if (e.target.value === register[0].password.value || e.target.value == '') {

            if (document.querySelector("#infoMsg").textContent === "Excellent") {
                $("#errMsg").text("");
                register[0].submit.disabled = false;
                $(e.target).removeClass("border-danger").addClass("border-success");
                console.log(register[0].submit);
            } else $("#errMsg").html("Your first <b style='cursor:pointer !important'><label for='pin'>password</label></b> strength isn't strong enough");

        } else {
            $(e.target).addClass("border-danger");
            $("#errMsg").text("Password doesn't match!");
            register[0].submit.disabled = true;
        }


    } else {
        console.log(document.querySelector("#infoMsg").textContent);
        console.log(e.target.value)
    }
});

register.submit(e => {
    $("#noUser").text("");
    $("#signupErr").text("Proccessing info...");
    const url = $(e)[0].target["action"];
    console.log(url);
    e.preventDefault();
    let data = {
        name: $(e)[0].target.name.value,
        email: $(e)[0].target.email.value,
        password: $(e)[0].target.password.value,
        Cpassword: $(e)[0].target.Cpassword.value
    };
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: (data) => {
            if (!data) console.error(data.msg);
            console.log(data);
            $("#signupErr").removeClass("text-danger");
            $("#signupErr").removeClass("text-warning").addClass("text-success");
            $("#signupErr").text("Account created successfully");

            setTimeout(() => {
                forms.register.parent().addClass('d-none');
                forms.login.parent().removeClass("d-none").addClass('d-block');
            }, 2000)
        },
        error: (msg) => {
            $("#signupErr").removeClass("text-warning").addClass("text-danger");
            $("#signupErr").text("Failed to create account");

            $("#signupErr").text(msg.responseJSON.msg);
            $("#signupErr").removeClass("text-warning").addClass("text-danger");
        },
        dataType: "json"
    });

    console.log(data);
});

login.submit(e => {
    $("#noUser").removeClass("text-danger").addClass("text-info");
    $("#noUser").text("Processing your inputs...");
    const url = $(e)[0].target["action"];

    e.preventDefault();

    let info = {
        email: $(e)[0].target.email.value,
        password: $(e)[0].target.password.value
    };

    try {
        $.ajax({
            type: "POST",
            url: url,
            data: info,
            success: (data) => {
                const { token } = data;
                localStorage.setItem('token', token);

                $("#noUser").removeClass("text-danger");
                $("#noUser").removeClass("text-info").addClass("text-success");
                $("#noUser").text(data.message);
                document.location.href = `/profile`;
            },
            error: (err) => {
                console.log(err.responseJSON);
                $("#noUser").removeClass("text-info").addClass("text-danger");
                $("#noUser").text(err.responseJSON.message)
            },
            dataType: "json"
        })
    } catch (err) {
        console.log(err)
    };

});