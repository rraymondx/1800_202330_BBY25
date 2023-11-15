// function getConversation() {
//     firestore().collection("users").where(FieldPath.documentId(), "in", UserIDs);
// }

var currentUser;


// --------------------------------
// Gets the ID of the current user.
// --------------------------------
function getUserId() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in:
        if (user) {
            currentUser = user.uid;
            retriveUserConvos();
        } else {
            // No user is signed in.
            console.log("No user is signed in");
        }
    });
}

// -------------------
// Get the other user.
// -------------------
async function getOtherUserName(convo) {
    let otherUser;

    convo.data().Users;
    for (let i = 0; i < convo.data().Users.length; i++) {
        if (convo.data().Users[i] != currentUser) {
            otherUser = convo.data().Users[i];
        }
    }

    let otherUserP = db.collection("users").doc(otherUser);

    try {
        const doc = await otherUserP.get();
        return doc.data().name;
    } catch (error) {
        console.error("Error fetching user string:", error);
        // Handle error appropriately
    }
}

// ----------------------------------------------
// Takes the user to the correct messaging chain.
// ----------------------------------------------
function takeToMessages(id) {
    localStorage.setItem("convoID", id);
    window.location.href = "./messaging.html";
}

// --------------------
// Generate convo list.
// --------------------
async function generateCard(convo, i) {
    let conversationTemplate = document.getElementById("contact-card");
    let conversation;
    let conversationList = document.getElementById("convo-container");
    let otherUser = await getOtherUserName(convo, i);

    console.log(otherUser)

    conversation = conversationTemplate.content.cloneNode(true);
    conversation.querySelector("#user-name").innerHTML = otherUser;
    conversation.querySelector("#contact-container").addEventListener("click", function() {
        takeToMessages(convo.id);
    }, false);
    conversationList.appendChild(conversation);
}

// ---------------------------------------------------------
// Gets the message chains that the user is involved in and
// Puts them into a new collection.
// Backwards thinking, we need to get users from reply
// ---------------------------------------------------------
function retriveUserConvos() {
    let totalConversations = db.collection("conversations"); // List of message chains
    let userConversations = totalConversations.where("Users", "array-contains", currentUser); // Message chains that involve the user.

    userConversations.get().then((doc) => {
        let involvedConvos = doc.docs;

        for (let i = 0; i < involvedConvos.length; i++) {
            generateCard(involvedConvos[i], i);
        }
    });
}

// ---------------------------------------------
// Take the user to their selected conversation.
// ---------------------------------------------
function toMessages(theConversation) {
    console.log("To messages.");
}

if (window.location.pathname == "/conversations.html")
    getUserId();

