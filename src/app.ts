import express from "express";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebaseConfig";

const app = express();
const router = express.Router();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Hello World!");
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
          setDoc(doc(db, `/users/${data.user.uid}/personalData`), {
            ...info,
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

app.listen(port, () => {
  return console.log(`Listening on port: ${port}`);
});
