// Get references to the UI elements
const messageInput = document.querySelector("#type_msg");
const sendButton = document.querySelector("#send_btn");

const conversations = db.collection("conversations").doc(localStorage.getItem("convoID"));

var currentUser;
var otherUser;

// --------------------------------
// Gets the ID of the current user.
// --------------------------------
function setup() {
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
function userIcon(message, id) {
  getUserProfileIcon(db.collection("users").doc(id))
  .then(userImg => {
    userIconS = '<img src="./images/profiles/' 
    + userImg + '" class="rounded-circle user_img">';
    message.innerHTML = userIconS;
  })
  .catch(error => {
    console.error("Error getting user profile icon: ", error);
  });
}

// --------------------------------------------------------------
// Populate the message list with messages from the conversation.
// --------------------------------------------------------------
async function populateMessage(messageArr, i) {
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
document.getElementById("message-list").addEventListener("click", updateScroll, false); // Update messages page on scroll.

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
let initState = true;

conversations.onSnapshot(doc => {
  let messageArr = doc.data().messages;
  if (initState) {
    initState = false;
  } else {
    if (messageArr.length > 0 && window.location.pathname == "/messaging.html") {
      populateMessage(messageArr, messageArr.length - 1);
    }
  }
});


// -------------------------------------------------
// Determine whether the conversation exists or not.
// -------------------------------------------------
function doesConvoExist(currentUserId, otherUserId) {
  let totalConversations = db.collection("conversations").where("Users", "array-contains-any", [currentUserId, otherUserId]); // List of message chains
  totalConversations.get().then(function(doc) {
    let conversations = doc.docs;
    conversations.forEach((doc) => {
      if (JSON.stringify(doc.data().Users) == JSON.stringify([currentUserId, otherUserId])) {
        console.log(doc.data().Users);
        return toGo = doc;
      }
    })
  });
}

// -------------------------------
// Creates a new message chain.
// Loads existing messaging chain.
// -------------------------------
function createNewMessage(currentUserId, otherUserId) {
  console.log(currentUserId + " " + otherUserId);
  //let userConversations = totalConversations.where("Users", "array-contains", currentUserId);

  let exists = false;
  let toGo;

  let totalConversations = db.collection("conversations").where("Users", "array-contains-any", [currentUserId, otherUserId]); // List of message chains
  totalConversations.get().then(function(doc) {
    let conversations = doc.docs;
    conversations.forEach((doc) => {
      if (JSON.stringify(doc.data().Users.sort()) == JSON.stringify([currentUserId, otherUserId].sort())) {
        exists = true;
        toGo = doc;
      }
    })
  }).then(function() {
    if (exists) {
      localStorage.setItem("convoID", toGo.id);
      window.location.assign("/messaging.html");
    } else {
      db.collection("conversations").add({
        Users: [currentUserId, otherUserId]
      }).then(function (doc) {
        localStorage.setItem("convoID", doc.id);
        window.location.assign("/messaging.html");
        console.log("Succes!");
      }).catch(function (error) {
        console.log("Error updating user data: " + error);
      });
    }
  });
}

if (window.location.pathname == "/messaging.html") {
  setup();
  loadMessageList();
}



// ------------------------------------
// Return the other users ID on demand.
// ------------------------------------
async function getOtherUserId() {
  const doc = await conversations.get();
  const users = doc.data().Users;
  console.log(users);
  for (let i = 0; i < users.length; i++) {
    if (users[i] !== currentUser) {
      otherUser = users[i]; // Assign to otherUser
      break; // Exit the loop once the other user is found
    }
  }
  return otherUser; // Return the other user's ID
}


// -------------------------------------------
// Add the review to the other user's document.
// -------------------------------------------
async function addReviewToUser(otherUserId, newRating) {
  const userRef = db.collection("users").doc(otherUserId);
  const reviewsRef = userRef.collection("reviews");

  try {
    // Start a batch to perform multiple write operations as one
    const batch = db.batch();

    // Add a new review document
    const newReviewRef = reviewsRef.doc();
    batch.set(newReviewRef, {
      rating: newRating,
      reviewerId: currentUser,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Get all reviews to calculate the new average
    const reviewsSnapshot = await reviewsRef.get();
    let totalRating = parseInt(newRating);
    let reviewCount = 1; // Start with 1 to account for the new review

    reviewsSnapshot.forEach(doc => {
      totalRating += parseInt(doc.data().rating);
      reviewCount++;
    });

    // Calculate the new average rating
    const averageRating = totalRating / reviewCount;

    // Update the user's document with the new average rating
    batch.update(userRef, { averageRating: averageRating });

    // Commit the batch
    await batch.commit();
    console.log("Review added and average updated successfully.");
  } catch (error) {
    console.error("Error adding review and updating average: ", error);
  }
}


// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', async (event) => {
  // ... (existing code for modal here)

  // Form submission for review
  const reviewForm = document.getElementById("review-form");
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission
    const rating = reviewForm.rating.value; // Get the rating from the form

    // Fetch the other user's ID and then add the review
    getOtherUserId(conversations).then((otherUserId) => {
      addReviewToUser(otherUserId, rating);
    });

    // Hide the modal after submitting the review
    modal.style.display = "none";
  });
});

