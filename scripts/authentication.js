// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// ----------------
// HowRu ui config.
// ----------------
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      //--------------------------------------------------------------
      // Generates Users in the Firestore database.
      // Records their name, email, country and location (random atm).
      //--------------------------------------------------------------
      var user = authResult.user;
      if (authResult.additionalUserInfo.isNewUser) {
          db.collection("users").doc(user.uid).set({
                 name: user.displayName,
                 email: user.email,
                 country: "Canada",
                 location: Math.random(100)
          }).then(function () {
                 console.log("New user added to firestore");
                 window.location.assign("main.html");
          }).catch(function (error) {
                 console.log("Error adding new user: " + error);
          });
      } else {
          return true;
      }
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
