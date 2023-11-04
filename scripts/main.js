function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
        // ----------------------------
        // Check if a user is signed in
        // ----------------------------
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            currentUser.get().then(userDoc => {
                // Retrieve the users user name
                var userName = userDoc.data().name;
                // Insert userName into the page
                document.getElementById("name-goes-here").innerText = userName;
            })
        } else {
            document.querySelector("#name-goes-here").innerText = "Anon?";
        }
    })
}

getNameFromAuth(); //run the function
