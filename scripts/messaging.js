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
function populateMessage(messageArr, i) {
  let messageTemplate;
  let message;

  let pointer = document.getElementById("messages-bottom-pointer");

  let messageList = document.getElementById("messages-container");
  let mesComp = messageArr[i].split("=");

  if (mesComp[0] == currentUser) {
    messageTemplate = document.getElementById("message-template-1");
    message = messageTemplate.content.cloneNode(true);
  } else {
    messageTemplate = document.getElementById("message-template-2");
    message = messageTemplate.content.cloneNode(true);
  }

  message.querySelector("#msg-goes-here").innerHTML = mesComp[1];
  messageList.insertBefore(message, pointer);

  updateScroll();
}

// ----------------------------------------------------------
// Load the message list with messages from the conversation.
// ----------------------------------------------------------
function loadMessageList() {
  conversations.get().then(doc => {
    if (!doc.exists) {
      console.log("not working");
    } else {
      if (doc.data().messages != null) {
        let messageArr = doc.data().messages;
        for (let i = 0; i < messageArr.length; i++) {
          populateMessage(messageArr, i);
        }
      }
    }
  });
}

// -----------------------------
// Updates the messaging scroll.
// -----------------------------
function updateScroll(){
  console.log("Being called");
  let messageElement = document.getElementById("messages-bottom-pointer");
  messageElement.scrollIntoView(false);
}

// -----------------------------------------
// Get the newest message from the datastore
// -----------------------------------------
function updateMessageList() {
  conversations.onSnapshot(doc => {
    if (!doc.exists) {
      console.log("not working");
    } else {
      if (doc.data().messages != null) {
        let messageArr = doc.data().messages;
        populateMessage(messageArr, (messageArr.length - 1));
      }
    }
  });
}

// -------------------------------------------
// Uploads messages to the firestore database.
// -------------------------------------------
function uploadMessageToDatabase() {
  let sendMessage = document.getElementById("message-input").value;
  let actualMessage = currentUser + "=" + sendMessage;

  document.getElementById("message-enter").reset();

  if (sendMessage != "") {
    conversations.update({
      messages: firebase.firestore.FieldValue.arrayUnion(actualMessage)
    }).then(() => {
      updateMessageList();
      console.log("Messages uploaded successfully.");
    });
  }
}

getUserId();
loadMessageList();
