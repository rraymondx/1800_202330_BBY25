function populateNameClassElements(userName) {
    var nameElements = document.getElementsByClassName('name-goes-here');
    for (let i = 0; i < nameElements.length; i++) {
        nameElements[i].innerHTML = userName;
    }
}

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
    });
}

getNameFromAuth();

function addUserLocationsToMap(map) {
    db.collection('users').get().then(allUsers => {
        const features = [];

        allUsers.forEach(doc => {
            const userData = doc.data();
            if (userData.location) {
                const coordinates = [userData.location.longitude, userData.location.latitude]; 

                features.push({
                    'type': 'Feature',
                    'properties': {
                        'description': userData.name
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates
                    }
                });
            }
        });

        map.addSource('user-locations', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        });

        map.addLayer({
            'id': 'user-locations',
            'type': 'circle', 
            'source': 'user-locations',
            'paint': {
                'circle-color': 'blue',
                'circle-radius': 12,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });
        let isPopupOpen = false; // Flag to track popup interaction

        let currentPopup = null; // Global variable to hold the current popup
let currentUser = null; // Variable to track the user of the current popup

map.on('mouseenter', 'user-locations', (e) => {
    if (e.features.length > 0) {
        const userName = e.features[0].properties.description;

        // Check if the popup for this user is already open
        if (currentUser === userName) {
            return; // Do nothing if the popup for this user is already open
        }

        // Close the existing popup if it's open for a different user
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }

         // Create a new popup for the new user
         currentPopup = new mapboxgl.Popup({ offset: 25 })
         .setLngLat(e.lngLat)
         .setHTML(`<strong>${userName}</strong><br><button onclick="replyToUser('${userName}')">Request to Engage</button><br><h1> I am sad<h1>`)
         .addTo(map);
     map.getCanvas().style.cursor = 'pointer';



        // Update the currentUser variable
        currentUser = userName;

        // Set flag to true when popup is opened
        isPopupOpen = true;

        // Reset flag and clear references when popup is closed
        currentPopup.on('close', () => {
            isPopupOpen = false;
            currentPopup = null;
            currentUser = null;
        });
    }
});

map.on('mouseleave', 'user-locations', () => {
    if (!isPopupOpen && currentPopup) {
        map.getCanvas().style.cursor = '';
        currentPopup.remove();
        currentPopup = null;
        currentUser = null; // Clear the current user reference
    }
});


       
    });
}

function showMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ'; // Replace with your Mapbox access token

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.964274, 49.236082],
        zoom: 8.8
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    map.on('load', function() {
        addUserLocationsToMap(map);
    });
}

showMap();
