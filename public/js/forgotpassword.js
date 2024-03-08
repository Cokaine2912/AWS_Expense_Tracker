function setPassword(event) {
  event.preventDefault();
  const email = event.target.email.value;
  const password = event.target.password.value;
  const confirm = event.target.confirm.value;

  if (password !== confirm) {
    return alert("Passwords not matching !!");
  }
  obj = {
    email: email,
    password: password,
  };
  axios
    .post("http://65.0.180.206:5000/password/forgotpassword", obj)
    .then((op) => {
      console.log(op);
    })
    .catch();
}
