// --------------------------------------------------------
// Populates the name-goes-here elements with the userName.
// --------------------------------------------------------
function populateNameClassElements(userName) {
    var nameElements = document.getElementsByClassName('name-goes-here');
    for (let i = 0; i < nameElements.length; i++) {
        nameElements[i].innerHTML = userName;
    }
}

function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
        // ----------------------------
        // Check if a user is signed in
        // ----------------------------
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            currentUser.get().then(userDoc => {
                // Retrieve the users userName
                var userName = userDoc.data().name;
                // Insert userName into the page
                populateNameClassElements(userName);
            })
        } else {
            document.querySelector("#name-goes-here").innerText = "Anon?";
        }
    })
}

getNameFromAuth(); //run the function

document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();
    const docRef = db.collection('users').doc("REqc6UlrlOViYIsX0u3Rm4dOkZa2");
    docRef.get().then((doc) => {
      if (doc.exists) {
        const locationSpan = document.querySelector('.location-goes-here');
        locationSpan.textContent = doc.data().location;
      } else {
        console.log('No such document!');
      }
    }).catch((error) => {
      console.error('Error getting document:', error);
    });
  });
  



