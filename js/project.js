import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
const auth = getAuth();
const projectId = localStorage.getItem("currentProject");
let selectedTaskId = null;
const todo = document.getElementById("todo");
const progress = document.getElementById("progress");
const done = document.getElementById("done");

document
.getElementById("createTaskBtn")
.addEventListener("click", createTask);

async function createTask(){

    const title=document.getElementById("taskTitle").value;
    const description=document.getElementById("taskDescription").value;
    const status=document.getElementById("taskStatus").value;

    if(title===""){

        alert("Enter task title");

        return;

    }

    await addDoc(collection(db,"tasks"),{

        projectId,

        title,

        description,

        status,

        createdAt:Date.now()

    });

}

const q=query(

collection(db,"tasks"),

where("projectId","==",projectId)

);

onSnapshot(q,(snapshot)=>{

todo.innerHTML="";
progress.innerHTML="";
done.innerHTML="";

snapshot.forEach((doc)=>{

const task=doc.data();

const card = `

<div
onclick="openTask('${doc.id}')"
style="
border:1px solid #ccc;
padding:12px;
margin-bottom:10px;
cursor:pointer;
border-radius:8px;
background:#f8f9fa;
">

<h3>${task.title}</h3>

<p>${task.description}</p>

<p><b>Status:</b> ${task.status}</p>

<p><b>Assigned To:</b> ${task.assignedTo || "Unassigned"}</p>

</div>

`;

if(task.status==="Todo"){

todo.innerHTML+=card;

}

else if(task.status==="In Progress"){

progress.innerHTML+=card;

}

else{

done.innerHTML+=card;

}

});

});
window.openTask = async function(taskId){
    selectedTaskId = taskId;
    const modal = document.getElementById("taskModal");

    modal.style.display = "block";

    const taskRef = doc(db,"tasks",taskId);

    const taskSnap = await getDoc(taskRef);

    const task = taskSnap.data();

    document.getElementById("editTitle").value = task.title;

    document.getElementById("editDescription").value = task.description;

    document.getElementById("editStatus").value = task.status;
    document.getElementById("assignedTo").value =
task.assignedTo || "";
    const commentList = document.getElementById("commentList");

const commentsQuery = query(
    collection(db, "comments"),
    where("taskId", "==", taskId),
    orderBy("createdAt")
);

onSnapshot(commentsQuery, (snapshot) => {

    commentList.innerHTML = "";

    snapshot.forEach((doc) => {

        const comment = doc.data();

        commentList.innerHTML += `
            <div style="margin-bottom:10px;padding:8px;border-bottom:1px solid #ddd;">
                <strong>${comment.userEmail}</strong><br>
                ${comment.text}
            </div>
        `;

    });

});
}
document
.getElementById("closeModalBtn")
.addEventListener("click",()=>{

document.getElementById("taskModal").style.display="none";

});
document.getElementById("saveTaskBtn").addEventListener("click", async () => {

    await updateDoc(doc(db, "tasks", selectedTaskId), {

        title: document.getElementById("editTitle").value,

        description: document.getElementById("editDescription").value,

        status: document.getElementById("editStatus").value,
        assignedTo:document.getElementById("assignedTo").value
    });

    alert("Task Updated!");

    document.getElementById("taskModal").style.display = "none";

});
document.getElementById("deleteTaskBtn").addEventListener("click", async () => {

    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "tasks", selectedTaskId));

    alert("Task Deleted!");

    document.getElementById("taskModal").style.display = "none";

});
document.getElementById("addCommentBtn").addEventListener("click", async () => {

    const text = document.getElementById("commentInput").value.trim();

    if (text === "") {
        alert("Enter a comment");
        return;
    }

    await addDoc(collection(db, "comments"), {

        taskId: selectedTaskId,
        userEmail: auth.currentUser.email,
        text: text,
        createdAt: Date.now()

    });

    document.getElementById("commentInput").value = "";

});