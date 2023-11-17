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
    console.log('DOM fully loaded and parsed');
    db.collection('users').get().then((querySnapshot) => {
      console.log(`Received ${querySnapshot.size} documents from Firestore`);
      let locationData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log(`User ID: ${doc.id}, Location: ${userData.location}`);
        locationData.push(userData.location);
      });
      if (locationData.length > 0) {
        updateHTML(locationData);
      } else {
        console.log('No location data found');
      }
    }).catch((error) => {
      console.error("Error getting documents: ", error);
    });
  });
  function updateHTML(locations) {
    let listHTML = '<ul>';
    locations.forEach((loc) => {
      if (loc !== undefined) {
      listHTML += `<li>${loc}</li>`;
      }
    });
    listHTML += '</ul>';
    //document.getElementById('locationList').innerHTML += listHTML;
    console.log('Updated location list in the DOM');
  }
  
  function showMap() {
    //------------------------------------------
    // Defines and initiates basic mapbox data
    //------------------------------------------
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
    const map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Styling URL
        center: [-122.964274, 49.236082], // Starting position
        zoom: 8.8 // Starting zoom
    });
  
    // Add user controls to map (compass and zoom) to top left
    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');
  
    // declare some globally used variables
    var userLocationMarker;
    var searchLocationMarker;
    var userLocation;
    var searchLocation;
  
    // Get the user's location
    navigator.geolocation.getCurrentPosition(function (position) {
        userLocation = [position.coords.longitude, position.coords.latitude];
        console.log(userLocation);
        console.log(searchLocation);
  
        // Add a marker to the map at the user's location
        userLocationMarker = new mapboxgl.Marker()
            .setLngLat(userLocation)
            .addTo(map);
  
        // Center the map on the user's location
        map.flyTo({
            center: userLocation
        }); 
    });
  
    // Add the MapboxGeocoder search box to the map
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    });
    map.addControl(geocoder);
  
    // Listen for the 'result' event from the geocoder (when a search is made)
    geocoder.on('result', function (e) {
        searchLocation = e.result.geometry.coordinates;
        console.log(userLocation);
        console.log(searchLocation);
  
        // Add a marker to the map at the search location
        searchLocationMarker && searchLocationMarker.remove(); // Remove the previous search marker if it exists
        searchLocationMarker = new mapboxgl.Marker({color: 'red'})
            .setLngLat(searchLocation)
            .addTo(map);
  
        // Fit the map to include both the user's location and the search location
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(userLocation);
        bounds.extend(searchLocation);
  
        map.fitBounds(bounds, {
            padding: {
                top: 100,
                bottom: 50,
                left: 100,
                right: 50
            } // Add some padding so that markers aren't at the edge or blocked
        });
    });
  }
  
  document.getElementById("messages-text-container").addEventListener('click', () => {
    window.location.href = "./conversations.html";
  }, false)

  document.getElementById("message-text-container").addEventListener('click', () => {
    window.location.href = "./space.html";
  }, false)

  showMap();

