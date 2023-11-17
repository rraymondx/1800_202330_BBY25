// Get references to the UI elements
const messageInput = document.querySelector("#type_msg");
const sendButton = document.querySelector("#send_btn");

const conversations = db.collection("conversations").doc(localStorage.getItem("convoID"));

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

// -------------------------
// Retrieve the user's icon.
// -------------------------
function userIcon(element, user) {
  getUserProfileIcon(db.collection("users").doc(user))
    .then(userImg => {
      element.innerHTML = '<img src="./images/profiles/' 
      + userImg + '" class="rounded-circle user_img">';
    })
    .catch(error => {
      console.error("Error getting user profile icon: ", error);
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
  let mesComp = messageArr[i].split("\r");

  if (mesComp[1] == currentUser) {
    messageTemplate = document.getElementById("message-template-1");
    message = messageTemplate.content.cloneNode(true);

  } else {
    messageTemplate = document.getElementById("message-template-2");
    message = messageTemplate.content.cloneNode(true);
    userIcon(message.querySelector("#user-img"), mesComp[1]);

  }
  message.querySelector("#msg-goes-here").innerHTML = mesComp[2];
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
function updateScroll() {
  let messageElement = document.getElementById("messages-bottom-pointer");
  messageElement.scrollIntoViewIfNeeded(false);
}

// ----------------------------------------------------------
// Generate message code.
// ----------------------------------------------------------
// ArrayUnion requires unique items to be added to arrays.
// We generate message codes to ensure that items are unique.
// ----------------------------------------------------------
function genRandMesgCode() {
  return Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
}

// -------------------------------------------
// Uploads messages to the firestore database.
// -------------------------------------------
function uploadMessageToDatabase() {
  let sendMessage = document.getElementById("message-input").value;
  let actualMessage = genRandMesgCode() + "\r" + currentUser + "\r" + sendMessage;

  document.getElementById("message-enter").reset();

  if (sendMessage != "") {
    conversations.update({
      messages: firebase.firestore.FieldValue.arrayUnion(actualMessage)
    }).then(() => {
      //updateMessageList();
      console.log("Messages uploaded successfully.");
    });
  }
}

// -----------------------------------------
// Get the newest message from the datastore
// DONT TOUCH THIS.
// -----------------------------------------
conversations.onSnapshot(doc => {
  let messageArr = doc.data().messages;
  if (!doc.exists) {
    console.log("not working");
  } else if (messageArr.length > 0) {
    populateMessage(messageArr, messageArr.length - 1);
  }
});

getUserId();
loadMessageList();
