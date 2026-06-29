import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    getDocs,
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

// ---------------- CREATE TASK ----------------

async function createTask() {

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const status = document.getElementById("taskStatus").value;

    if (title === "") {
        alert("Enter task title");
        return;
    }

    await addDoc(collection(db, "tasks"), {

        projectId,
        title,
        description,
        status,
        assignedTo: "",
        createdAt: Date.now()

    });

    // Clear form
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskStatus").value = "Todo";

}

// ---------------- LOAD TASKS ----------------

const q = query(
    collection(db, "tasks"),
    where("projectId", "==", projectId)
);

onSnapshot(q, (snapshot) => {

    todo.innerHTML = "";
    progress.innerHTML = "";
    done.innerHTML = "";

    snapshot.forEach((taskDoc) => {

        const task = taskDoc.data();

        const card = `
        <div class="task-card" onclick="openTask('${taskDoc.id}')">

            <h3>${task.title}</h3>

            <p>${task.description}</p>

            <p><strong>Status:</strong> ${task.status}</p>

            <p><strong>Assigned:</strong> ${task.assignedTo || "Unassigned"}</p>

        </div>
        `;

        if (task.status === "Todo") {

            todo.innerHTML += card;

        } else if (task.status === "In Progress") {

            progress.innerHTML += card;

        } else {

            done.innerHTML += card;

        }

    });

});

// ---------------- OPEN TASK ----------------

window.openTask = async function (taskId) {

    selectedTaskId = taskId;

    document.getElementById("taskModal").style.display = "block";

    const taskSnap = await getDoc(doc(db, "tasks", taskId));

    const task = taskSnap.data();

    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDescription").value = task.description;
    document.getElementById("editStatus").value = task.status;

    // ---------- Load Members ----------

    const assignSelect = document.getElementById("assignedTo");

    assignSelect.innerHTML = `<option value="">Unassigned</option>`;

    const projectSnap = await getDoc(doc(db, "projects", projectId));

    const projectData = projectSnap.data();

    const members = projectData.members || [];

    members.forEach(member => {

        assignSelect.innerHTML += `
            <option value="${member}">
                ${member}
            </option>
        `;

    });

    assignSelect.value = task.assignedTo || "";

    // ---------- Load Comments ----------

    const commentList = document.getElementById("commentList");

    commentList.innerHTML = "";

    const commentsQuery = query(
        collection(db, "comments"),
        where("taskId", "==", taskId),
        orderBy("createdAt")
    );

    const commentsSnapshot = await getDocs(commentsQuery);

    commentsSnapshot.forEach((commentDoc) => {

        const comment = commentDoc.data();

        commentList.innerHTML += `
            <div class="comment">

                <strong>${comment.userEmail}</strong>

                <p>${comment.text}</p>

            </div>
        `;

    });

}

// ---------------- CLOSE MODAL ----------------

document
.getElementById("closeModalBtn")
.addEventListener("click", () => {

    document.getElementById("taskModal").style.display = "none";

});

// ---------------- SAVE TASK ----------------

document
.getElementById("saveTaskBtn")
.addEventListener("click", async () => {

    await updateDoc(doc(db, "tasks", selectedTaskId), {

        title: document.getElementById("editTitle").value,

        description: document.getElementById("editDescription").value,

        status: document.getElementById("editStatus").value,

        assignedTo: document.getElementById("assignedTo").value

    });

    document.getElementById("taskModal").style.display = "none";

});

// ---------------- DELETE TASK ----------------

document
.getElementById("deleteTaskBtn")
.addEventListener("click", async () => {

    const confirmDelete = confirm("Delete this task?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "tasks", selectedTaskId));

    document.getElementById("taskModal").style.display = "none";

});

// ---------------- ADD COMMENT ----------------

document
.getElementById("addCommentBtn")
.addEventListener("click", async () => {

    const text = document.getElementById("commentInput").value.trim();

    if (text === "") {

        alert("Enter a comment");

        return;

    }

    await addDoc(collection(db, "comments"), {

        taskId: selectedTaskId,

        userEmail: auth.currentUser.email,

        text,

        createdAt: Date.now()

    });

    document.getElementById("commentInput").value = "";

    // Refresh comments immediately

    window.openTask(selectedTaskId);

});