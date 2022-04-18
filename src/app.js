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

//https://api.dexcom.com/v2/oauth2/login?client_id=MtO4CwJyz9yXacjPiH7kuHKNXKnY4HaE&redirect_uri=http://localhost:4000/connect-dexcom&response_type=code&scope=offline_access&state=value

app.get("/test", (req, res) => {
  res.send("Hello World!");
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
        redirect_uri: "http://localhost:4000/connect-dexcom",
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
});

app.get("/connect-dexcom", async (req, res) => {
  const fullUrl = url.parse(req.url, true);
  const { code, state } = fullUrl.query;

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
        redirect_uri: "http://192.168.1.14:4000/connect-dexcom",
      },
      null,
      null,
      { encodeURIComponent: qs.unescape }
    )
  );
  request.end();

  res.json({ code: code, state: state });
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
