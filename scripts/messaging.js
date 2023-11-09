// Get references to the UI elements
const messageInput = document.querySelector("#type_msg");
const sendButton = document.querySelector("#send_btn");

const conversations = db.collection("conversations").doc("N9jI6iqMJ7Lm5FXqDW99");

var currentUser;

// --------------------------------
// Gets the ID of the current user.
// --------------------------------
function getUserId() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if user is signed in:
    if (user) {
      currentUser = user.uid;
    } else {
      // No user is signed in.
      console.log("No user is signed in");
    }
  });
}

// --------------------------------------------------------------
// Populate the message list with messages from the conversation.
// --------------------------------------------------------------
function populateMessageList() {
  let messageTemplate = document.getElementById("message-template");
  let messageList = document.getElementById("message-list");

  conversations.get().then(doc => {
    if (!doc.exists) {
      console.log("not working");
    } else {
      if (doc.data().messages != null) {
        let messageArr = doc.data().messages;
        for (let i = 0; i < messageArr.length; i++) {
          let mesComp = messageArr[i].split("=");
          let message = messageTemplate.content.cloneNode(true);
          message.querySelector("#msg-goes-here").innerHTML = mesComp[1];
          messageList.appendChild(message);
        }
      }
    }
  })
}

// -----------------------------------------
// Get the newest message from the datastore
// -----------------------------------------
function updateMessageList() {
  let messageTemplate = document.getElementById("message-template");
  let messageList = document.getElementById("message-list");

  conversations.onSnapshot(doc => {
    if (!doc.exists) {
      console.log("not working");
    } else {
      if (doc.data().messages != null) {
        let messageArr = doc.data().messages;
        let lastMessageIndex = messageArr.length - 1;

        let mesComp = messageArr[lastMessageIndex].split("=");
        let message = messageTemplate.content.cloneNode(true);
        message.querySelector("#msg-goes-here").innerHTML = mesComp[1];
        messageList.appendChild(message);
      }
    }
  })
}

// -------------------------------------------
// Uploads messages to the firestore database.
// -------------------------------------------
function uploadMessageToDatabase() {
  let sendMessage = document.getElementById("message-input").value;
  console.log(document.getElementById("message-input").value);
  let actualMessage = currentUser + "=" + sendMessage;

  if (sendMessage != "") {
    conversations.update({
      messages: firebase.firestore.FieldValue.arrayUnion(actualMessage)
    }).then(() => {
      updateMessageList();
      console.log("Messages uploaded successfully.");
    })
  }
}

getUserId();
populateMessageList();
