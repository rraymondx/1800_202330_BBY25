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
  

  document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const docRef = db.collection('users').doc(user.uid);
            docRef.get().then(function(doc) {
                if (doc.exists) {
                    const geoPoint = doc.data().location;
                    const userLocation = {
                        lat: geoPoint.latitude,
                        lng: geoPoint.longitude
                    };
                    // Use this location in Mapbox
                    addUserLocationToMap(userLocation);
                } else {
                    console.log('No such document!');
                }
            }).catch(function(error) {
                console.error('Error getting document:', error);
            });
        } else {
            // No user is signed in
            console.log('No user is signed in.');
        }
    });
});

function addUserLocationToMap(userLocation) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [userLocation.lng, userLocation.lat],
        zoom: 8.8
    });

    new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);

    map.flyTo({ center: [userLocation.lng, userLocation.lat] });
}

function showMap() {
    // Initialize Mapbox with your access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';

    // Create a new map instance
    const map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Map style URL
        center: [-122.964274, 49.236082], // Initial position [longitude, latitude]
        zoom: 8.8 // Initial zoom level
    });

    
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    
    db.collection('users').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            
            if (doc.exists && doc.data().location && !isNaN(doc.data().location.latitude) && !isNaN(doc.data().location.longitude)) {
                const geoPoint = doc.data().location;
                const userLocation = {
                    lat: geoPoint.latitude,
                    lng: geoPoint.longitude
                };

                
                new mapboxgl.Marker()
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .addTo(map);
            }
        });
    }).catch((error) => {
        console.error('Error getting documents:', error);
    });
}


showMap();


