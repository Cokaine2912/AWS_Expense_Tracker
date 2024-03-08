async function REDIRECT(event) {
  event.preventDefault();
  const obj = { email: event.target.email.value };
  const op = await axios.post("http://65.0.180.206:5000/password/resetlink", obj);
  if (op.data.error) {
    document.getElementById("email").value = ""
    return alert(op.data.error);
  }
  return alert("Reset link sent to your email.")
  // const res = await axios.get(`http://65.0.180.206:5000/password/resetpassword/${op.data.id}`)
}

