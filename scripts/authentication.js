// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// ----------------
// HowRu ui config.
// ----------------
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        var user = authResult.user;
        navigator.geolocation.getCurrentPosition(function (position) {
            var userLocation = new firebase.firestore.GeoPoint(position.coords.latitude, position.coords.longitude);
    
            db.collection("users").doc(user.uid).set({
                name: user.displayName || "Unknown", 
                email: user.email,
                country: "Canada", 
                location: userLocation
            }, { merge: true }).then(function () { 
                console.log("User data updated in firestore");
                window.location.assign("main.html");
            }).catch(function (error) {
                console.log("Error updating user data: " + error);
            });
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
