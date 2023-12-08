// --------------------------------------------------------
// Populates the name-goes-here elements with the userName.
// --------------------------------------------------------
function populateNameClassElements(userName) {
    var nameElements = document.getElementsByClassName('name-goes-here');
    for (let i = 0; i < nameElements.length; i++) {
        nameElements[i].innerHTML = userName;
    }
}

// ---------------------------------------------------------------
// Retrieves username and populates elements with the user's name.
// ---------------------------------------------------------------
function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            currentUser.get().then(userDoc => {
                var userName = userDoc.data().name;
                populateNameClassElements(userName);
            })
        } else {
            document.querySelector("#name-goes-here").innerText = "Anon?";
        }
    })
}

getNameFromAuth();
  
// ------------------
// Main Page Buttons.
// ------------------
document.getElementById("messages-text-container").addEventListener('click', () => {
  window.location.href = "./conversations.html";
}, false);

document.getElementById("space-text-container").addEventListener('click', () => {
  window.location.href = "./space.html";
}, false);

document.getElementById("resources-text-container").addEventListener('click',() => {
  window.location.href = "./resources.html"
}, false);
