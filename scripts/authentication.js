// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// -----------------------------------------------
// Get a random icon for the user when they login.
// -----------------------------------------------
function getUserIcon() {
    let potentialIcons = [
        'llama1.jpg', 'llama2.jpg', 'llama3.jpg', 'llama4.jpg', 'llama5.jpg', 
        'llama6.jpg', 'llama7.jpg', 'llama8.jpg', 'llama9.jpg', 'llama10.jpg', 
        'llama11.jpg', 'llama12.jpg', 'llama13.jpg', 'llama14.jpg', 'llama15.jpg'];

    let randomNumber = Math.floor(Math.random() * (14 - 0 + 1) + 1);    
    return potentialIcons[randomNumber];
}

// ----------------
// HowRu ui config.
// ----------------
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        var user = authResult.user;
        navigator.geolocation.getCurrentPosition(function (position) {
            var userLocation = new firebase.firestore.GeoPoint(position.coords.latitude, position.coords.longitude);
    
            if (authResult.additionalUserInfo.isNewUser) {
                db.collection("users").doc(user.uid).set({
                    name: user.displayName || "Unknown", 
                    email: user.email,
                    country: "Canada", 
                    location: userLocation,
                    picture: "" + getUserIcon()
                }, { merge: true }).then(function () { 
                    window.location.assign("main.html");
                }).catch(function (error) {
                    console.log("Error updating user data: " + error);
                });       
            } else {
                db.collection("users").doc(user.uid).set({
                    location: userLocation,
                }, { merge: true }).then(function () { 
                    window.location.assign("main.html");
                }).catch(function (error) {
                    console.log("Error updating user data: " + error);
                });  
            }
        }, function (error) {
            console.warn(`ERROR(${error.code}): ${error.message}`);
            
        });
    
        return false; 
    },
    
    
  
  },
  signInFlow: 'popup',
  signInSuccessUrl: "./main.html",
  signInOptions: [ {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    }
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
};

ui.start('#firebaseui-auth-container', uiConfig);
