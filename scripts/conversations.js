// function getConversation() {
//     firestore().collection("users").where(FieldPath.documentId(), "in", UserIDs);
// }

var currentUser;

function getUserConversations() {

    if (currentUser) {
        // User is signed in, now let's get the conversations
        var conversationsRef = db.collection("conversations");

        // Query the conversations where the logged-in user is a participant
        conversationsRef
            .where("participants", "array-contains", user.uid)
            .get()
            .then((snapshot) => {
                // Check if there are any conversations
                if (snapshot.empty) {
                    console.log("No matching conversations.");
                    return;
                }

                // Create a collection entity to store the conversations
                var userConversationsRef = db
                    .collection("userConversations")
                    .doc(user.uid);

                // Prepare the conversations data
                var userConversationsData = {
                    conversations: [],
                };

                snapshot.forEach((doc) => {
                    console.log(doc.id, "=>", doc.data());
                    userConversationsData.conversations.push(doc.data());
                });

                // Set the conversations data in the new collection entity
                userConversationsRef
                    .set(userConversationsData)
                    .then(() => {
                        console.log("User conversations stored successfully!");
                    })
                    .catch((error) => {
                        console.error("Error storing conversations: ", error);
                    });
            })
            .catch((error) => {
                console.log("Error getting documents:", error);
            });
    } else {
        // No user is signed in
        console.log("No user logged in.");
    }
}

getUserConversations();