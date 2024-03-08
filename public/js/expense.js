/// STATUS !

let leader_board_open = false;

let USERNAME = "USERNAME";

//////////// FUCNTIONS ////////////////////////////////////

async function showLeaderBoard() {
  if (leader_board_open) {
    const table_div = document.getElementById("table-div");
    table_div.removeChild(table_div.firstChild);

    leader_board_open = false;
  } else {
    const table_div = document.getElementById("table-div");

    const table_html = `<table id="expenseTable">
    <thead>
      <tr>
        <th>Name</th>
        <th>Total Expenses ($)</th>
      </tr>
    </thead>
    <tbody id="tableBody">
    </tbody>
  </table>`;
    table_div.innerHTML = table_html;
    const leader_html = `<table id="expenseTable">
    <thead>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Total Expenses ($)</th>
      </tr>
    </thead>
    <tbody id="tableBody">
      <!-- Table body will be dynamically populated using JavaScript -->
    </tbody>
  </table>`;

    /////////////////////////////////////

    // Create a temporary div element
    const tempDiv = document.createElement("div");

    // Set the innerHTML of the temporary div to your HTML markup
    tempDiv.innerHTML = leader_html;

    /////////////////////////////////////

    const table_body = document.createElement("tbody");
    const table = document.getElementById("expenseTable");
    table_body.id = "tableBody";

    table.appendChild(table_body);

    const leaderBoard = await axios.get(
      "http://65.0.180.206:5000/premium/leaderboard"
    );

    populateTable(leaderBoard.data);

    leader_board_open = true;
  }
}

function display_board(obj) {
  const ul = document.getElementById("leader-board-ul");
  const li = document.createElement("li");
  li.className = "leader-item";
  let totalExpense = 0;
  if (obj.totalExpense) {
    totalExpense = obj.totalExpense;
  }

  const li_text = document.createTextNode(
    `${obj.username} | Total Expense : ${totalExpense}`
  );
  li.appendChild(li_text);

  ul.appendChild(li);
}

function populateTable(data) {
  var tableBody = document.getElementById("tableBody");
  data.forEach(function (item) {
    var row = tableBody.insertRow();
    // row.insertCell(0).textContent = item.id;
    row.insertCell(0).textContent = item.username;
    row.insertCell(1).textContent =
      item.totalExpense === null ? "0" : item.totalSpendings;
  });
}

////////////////////////////////////////////////////////////

const existing_token = localStorage.getItem("token");

if (!existing_token) {
  window.location.href = "./login.html";
} else {
  function premiumCheck() {
    return new Promise(async (resolve, reject) => {
      const token = localStorage.getItem("token");
      const bool = await axios.get(
        "http://65.0.180.206:5000/expense/premiumness",
        {
          headers: { Authorization: token },
        }
      );
      if (bool.premium) {
        garibsePremium();
      }
      resolve(bool);
    });
  }

  async function ONLOAD() {
    const bool = await premiumCheck();
    USERNAME = bool.data.username;

    const username_button = document.getElementById("username-dropdown");
    const username_button_text = document.createTextNode(USERNAME);
    username_button.appendChild(username_button_text);
    if (bool.data.premium) {
      garibsePremium();
    }
    const token = localStorage.getItem("token");
    const all = await axios.get(
      "http://65.0.180.206:5000/expense/allexpensedata",
      {
        headers: { Authorization: token },
      }
    );

    for (let i = 0; i < all.data.length; i++) {
      DISPLAY(all.data[i]);
    }
  }
  ONLOAD();

  function DISPLAY(obj) {
    const ul = document.getElementById("expense-list");
    const li = document.createElement("li");
    li.className = "list-item";
    const li_text = document.createTextNode(
      `${obj.amount} - ${obj.description} - ${obj.category}`
    );
    li.id = obj.id;
    li.appendChild(li_text);
    ul.appendChild(li);

    const db = document.createElement("button");
    const db_text = document.createTextNode("❌");
    db.className = "db";
    db.appendChild(db_text);
    li.appendChild(db);
  }

  function ADDEXPENSE(event) {
    event.preventDefault();
    obj = {
      amount: event.target.amount.value,
      description: event.target.description.value,
      category: event.target.category.value,
      token: localStorage.getItem("token"),
    };
    axios
      .post("http://65.0.180.206:5000/expense/addexpense", obj)
      .then((op) => {
        DISPLAY(op.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function garibsePremium() {
    const rzp_button = document.getElementById("rzp-button");
    rzp_button.remove();
    const if_premium = document.getElementById("if-premium");
    if_premium.logo = "premium-logo";
    const premium_text = document.createTextNode("Premium");
    if_premium.appendChild(premium_text);

    const leader_button = document.createElement("button");
    leader_button.id = "leader-button";
    const leader_text = document.createTextNode("Leaderboard");
    const button_div = document.getElementById("leader-button-div");

    leader_button.appendChild(leader_text);
    leader_button.className = "btn btn-outline-primary";
    button_div.appendChild(leader_button);

    leader_button.onclick = showLeaderBoard;
  }

  const ExpenseList = document.getElementById("expense-list");

  if (ExpenseList) {
    ExpenseList.addEventListener("click", async function (event) {
      if (event.target.classList.contains("db")) {
        const todel = event.target.parentElement;
        await axios.delete(
          `http://65.0.180.206:5000/expense/deleteexpense/${todel.id}`
        );
        ExpenseList.removeChild(todel);
      }
    });
  }

  const rzp_button = document.getElementById("rzp-button");

  if (rzp_button) {
    rzp_button.onclick = async function (event) {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://65.0.180.206:5000/purchase/premium",
        {
          headers: { Authorization: token },
        }
      );
      var options = {
        key: response.data.key_id,
        order_id: response.data.order.id,
        handler: async function (response) {
          const update_response = await axios.post(
            "http://65.0.180.206:5000/purchase/premium/updatetransactionstatus",
            {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
            },
            { headers: { Authorization: token } }
          );
          localStorage.setItem("token", update_response.data.token);
          alert("You are a Premium User !!");
          garibsePremium();
        },
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
      event.preventDefault();

      rzp1.on("payment.failed", async function (response) {
        await axios.post(
          "http://65.0.180.206:5000/purchase/premium/updatefailure",
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
            order_success: false,
          },
          { headers: { Authorization: token } }
        );
        alert("Something Went Wrong !");
      });
    };
  }
}
