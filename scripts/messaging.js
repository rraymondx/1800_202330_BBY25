// Get references to the UI elements
const messageInput = document.querySelector(".type_msg");
const sendButton = document.querySelector(".send_btn");

// Event listener for send button
sendButton.addEventListener("click", function () {
  const message = messageInput.value.trim();
  if (message) {
    sendMessageToFirebase(message);
  }
});

// Function to send message to Firebase
function sendMessageToFirebase(message) {
  // Here we push the message to the 'messages' node of the Firebase database
  database
    .ref("messages")
    .push({
      text: message,
      timestamp: Date.now(),
    })
    .then(() => {
      console.log("Message stored to Firebase!");
      // Clear the message input after sending
      messageInput.value = "";
    })
    .catch((error) => {
      console.error("Error writing message to Firebase", error);
    });
}
