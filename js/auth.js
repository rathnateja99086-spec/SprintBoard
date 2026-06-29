import { auth } from "./firebase-config.js";

import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Register
const registerBtn = document.getElementById("registerBtn");

if(registerBtn){

registerBtn.addEventListener("click", async()=>{

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

try{

await createUserWithEmailAndPassword(auth,email,password);

alert("Registration Successful!");

window.location="login.html";

}

catch(error){

alert(error.message);

}

});

}

// Login

const loginBtn=document.getElementById("loginBtn");

if(loginBtn){

loginBtn.addEventListener("click",async()=>{

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

try{

await signInWithEmailAndPassword(auth,email,password);

alert("Login Successful!");

window.location="dashboard.html";

}

catch(error){

alert(error.message);

}

});

}