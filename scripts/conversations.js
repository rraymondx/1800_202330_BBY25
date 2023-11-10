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

function generateConvoName() {
    let id = "Convo-";
    let idNum = Math.random(100000000000);

    return id + idNum;
}

// ---------------------------------------------------------
// Gets the message chains that the user is involved in and
// Puts them into a new collection.
// Backwards thinking, we need to get users from reply
// ---------------------------------------------------------

/*
function retriveUserConvos() {
    let totalConversations = db.collection("conversations");

    const q = totalConversations.where("Users", "array-contains", currentUser)

    q.get()
        .then(snapshot => {
            // If the query returned multiple documents, you need to loop through them
            snapshot.forEach(doc => {
                let theUsers = (doc.id, " => ", doc.data().Users);

                let conversationName = "c=" + theUsers[0] + "=" + theUsers[1];
                console.log(conversationName);

                if (!doc.exists()) {
                    db.collection("userConversations").doc(conversationName).set({
                        users: theUsers
                    }).then(function (){
                        console.log("New Document");
                    }).catch(function (error) {
                        console.log("Error occured" + error);
                    })
                }
            });
        })
        .catch(error => {
            // It's important to catch any errors that occur during the get
            console.error("Error getting documents: ", error);
        });
} 

Code is useless btw.

*/
getUserId();
