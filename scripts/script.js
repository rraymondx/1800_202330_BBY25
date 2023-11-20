// -----------------------------------------------
// Random Test Function
// -----------------------------------------------
// function sayHello() {
//   console.log("Hello!");
// }

//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
  firebase.auth().signOut().then(() => {
      // Sign-out successful.
      console.log("logging out user");
    }).catch((error) => {
      // An error happened.
    });
}

