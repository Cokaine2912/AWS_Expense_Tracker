function signupForm(event) {
  event.preventDefault();

  const obj = {
    username: event.target.username.value,
    email: event.target.email.value,
    password: event.target.password.value,
  };
  axios
    .post("http://65.0.180.206:5000/user/signup", obj)
    .then((op) => {
      if (op.data.error) {
        const fields = document.getElementsByClassName("ip-fields");

        for (let i = 0; i < fields.length; i++) {
          fields[i].value = "";
        }

        alert(op.data.error);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
