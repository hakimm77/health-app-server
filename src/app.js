const express = require("express");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const { auth, db } = require("./firebase/firebaseConfig");
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
} = require("firebase/firestore");
const url = require("url");
var qs = require("querystring");
var http = require("https");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  res.send(`<h1>Connection managed! you can go back to the health app </h1>`);
});

app.get("/get-users-data", async (req, res) => {
  getDocs(collection(db, `/users`)).then(async (response) => {
    let arr = [];

    await response.forEach(async (child) => {
      arr = [...arr, child.data()];
    });

    console.log(arr);

    res.json(arr);
  });
});

app.post("/save-results", async (req, res) => {
  const { uid, data } = req.body;

  updateDoc(doc(db, `users/${uid}`), {
    data: data,
  });
});

app.post("/refresh-token", async (req, res) => {
  const { refreshToken, username } = req.body;

  var options = {
    method: "POST",
    hostname: "api.dexcom.com",
    port: null,
    path: "/v2/oauth2/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
    },
  };

  var request = http.request(options, function (result) {
    var chunks = [];

    result.on("data", function (chunk) {
      chunks.push(chunk);
    });

    result.on("end", function () {
      var body = Buffer.concat(chunks);
      const newTokens = JSON.parse(body.toString());
      console.log(newTokens);
      updateDoc(doc(db, `/connections/${username}`), {
        authToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
      });
    });
  });

  request.write(
    qs.stringify(
      {
        client_secret: "cMBqNs13p6FTk4fV",
        client_id: "MtO4CwJyz9yXacjPiH7kuHKNXKnY4HaE",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        redirect_uri: "https://polar-river-98280.herokuapp.com/connect-dexcom",
      },
      null,
      null,
      { encodeURIComponent: qs.unescape }
    )
  );
  request.end();
});

app.post("/get-glucose", async (req, res) => {
  const { username } = req.body;

  await getDoc(doc(db, `/connections/${username}/`)).then((snapchot) => {
    console.log(snapchot.data().authToken);
    const date = new Date();
    const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

    date.setMonth(date.getMonth() - 3);

    const oneMonthAgo = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    console.log(today);
    var options = {
      method: "GET",
      hostname: "api.dexcom.com",
      port: null,
      path: `/v2/users/self/egvs?startDate=${oneMonthAgo}&endDate=${today}`,
      headers: {
        authorization: `Bearer ${snapchot.data().authToken}`,
      },
    };

    var request = http.request(options, function (response) {
      var chunks = [];

      response.on("data", function (chunk) {
        chunks.push(chunk);
      });

      response.on("end", function () {
        var body = Buffer.concat(chunks);
        res.json(JSON.parse(body.toString()));
      });
    });

    request.end();
  });

  console.log("heyvye");
});

app.get("/connect-dexcom", async (req, res) => {
  const fullUrl = url.parse(req.url, true);
  const { code, state } = fullUrl.query;

  var options = {
    method: "POST",
    hostname: "api.dexcom.com",
    port: null,
    path: "/v2/oauth2/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
    },
  };

  var request = http.request(options, (result) => {
    var chunks = [];

    result.on("data", function (chunk) {
      chunks.push(chunk);
    });

    result.on("end", async () => {
      var body = Buffer.concat(chunks);
      const authToken = JSON.parse(body.toString()).access_token;
      const refreshToken = JSON.parse(body.toString()).refresh_token;
      console.log(JSON.parse(body.toString()));

      setDoc(doc(db, `/connections/${state}`), {
        authToken: authToken,
        refreshToken: refreshToken,
        username: state,
      });
    });
  });

  request.write(
    qs.stringify(
      {
        client_secret: "cMBqNs13p6FTk4fV",
        client_id: "MtO4CwJyz9yXacjPiH7kuHKNXKnY4HaE",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "https://polar-river-98280.herokuapp.com/connect-dexcom",
      },
      null,
      null,
      { encodeURIComponent: qs.unescape }
    )
  );
  request.end();

  res.send(`<h3>Connection managed! you can go back to the health app </h3>`);
});

app.post("/authenticate", async (req, res) => {
  const { email, password, info, isAdmin, authType } = req.body;

  switch (authType) {
    case "login":
      signInWithEmailAndPassword(auth, email, password)
        .then((data) => {
          res.json(data.user.uid);
        })
        .catch((err) => {
          res.json(err);
        });
      break;
    case "signup":
      createUserWithEmailAndPassword(auth, email, password)
        .then((data) => {
          setDoc(doc(db, `/users/${data.user.uid}`), {
            username: info.username,
            email: email,
            isAdmin: isAdmin,
          });

          res.json(data.user.uid);
        })
        .catch((err) => {
          res.json(err);
        });
      break;
    case "admin":
      if (password === "michel-admin1212") {
        res.json("admin");
      } else {
        res.json({ code: "Wrong password, try again" });
      }
      break;
  }
});

app.post("/getAccountInfo", async (req, res) => {
  const { uid } = req.body;

  getDoc(doc(db, `/users/${uid}`)).then((response) => {
    res.json(response.data());
  });
});

app.listen(PORT, () => {
  return console.log(`Listening on port: ${PORT}`);
});
