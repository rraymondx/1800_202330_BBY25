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
function getOtherUserName(convo, i) {
    let otherUser;

    convo.data().Users;
    for (let i = 0; i < convo.data().Users.length; i++) {
        if (convo.data().Users[i] != currentUser) {
            otherUser = convo.data().Users[i];
        }
    }

    let otherUserP = db.collection("users").doc(otherUser);

    otherUserP.get().then((doc) => {
        //console.log(doc.data().name);
        return doc.data().name;
    });
}

// --------------------
// Generate convo list.
// --------------------
function generateCard(convo, i) {
    let conversationTemplate;
    let conversation;

    //let conversationList = document.getElementById();
    let otherUser = getOtherUserName(convo, i);
    console.log(otherUser);
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

getUserId();

