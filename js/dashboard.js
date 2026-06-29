import { auth, db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");
const createBtn = document.getElementById("createProjectBtn");
const projectList = document.getElementById("projectList");

let currentUser;

// Check login
onAuthStateChanged(auth, async(user) => {

    if(!user){
        window.location = "login.html";
        return;
    }

    currentUser = user;

    loadProjects();

});

// Logout
logoutBtn.addEventListener("click", async()=>{

    await signOut(auth);

    window.location = "login.html";

});

// Create Project

createBtn.addEventListener("click", async()=>{

    const name = document.getElementById("projectName").value;

    const description = document.getElementById("projectDescription").value;

    if(name===""){
        alert("Enter project name");
        return;
    }

    await addDoc(collection(db,"projects"),{

        name,
        description,

        owner: currentUser.uid,

        createdAt: Date.now()

    });

    alert("Project Created");

    loadProjects();

});

async function loadProjects() {

    projectList.innerHTML = "";

    const q = query(
        collection(db, "projects"),
        where("owner", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((projectDoc) => {

        const project = projectDoc.data();

        projectList.innerHTML += `
        <div class="project-card">

            <h3>${project.name}</h3>

            <p>${project.description}</p>

            <button onclick="openProject('${projectDoc.id}')">
                Open Board
            </button>

            <br><br>

            <input
                id="member-${projectDoc.id}"
                placeholder="Member Email">

            <button onclick="addMember('${projectDoc.id}')">
                Add Member
            </button>

        </div>
        `;

    });

}
window.openProject = function (projectId) {

    localStorage.setItem("currentProject", projectId);

    window.location.href = "project.html";

};
window.addMember = async function(projectId){

    const email = document.getElementById(`member-${projectId}`).value.trim();

    if(email === ""){
        alert("Enter member email");
        return;
    }

    if(!email.includes("@")){
        alert("Enter a valid email");
        return;
    }

    await updateDoc(doc(db,"projects",projectId),{
        members: arrayUnion(email)
    });

    alert("Member Added!");

    document.getElementById(`member-${projectId}`).value = "";
}