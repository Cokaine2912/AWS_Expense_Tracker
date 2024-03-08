function Login(event) {
  event.preventDefault();
  obj = {
    email: event.target.email.value,
    password: event.target.password.value,
  };
  axios
    .post("http://65.0.180.206:5000/user/login", obj)
    .then((op) => {
      let token = op.data.token;
      if (op.data.success) {
        localStorage.setItem("token", token);
        window.location.href = "./expense.html";
      }
    })
    .catch((err) => {
      console.log(err.response.data);
      alert(err.response.data.error);
    });
}

function forgotRedirect(event){
  alert("Password Reset Link sent to the email")
}
