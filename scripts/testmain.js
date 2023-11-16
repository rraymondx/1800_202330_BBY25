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

//   document.addEventListener('DOMContentLoaded', function() {
//     firebase.auth().onAuthStateChanged(function(user) {
//         if (user) {
//             const docRef = db.collection('users').doc(user.uid);
//             docRef.get().then(function(doc) {
//                 if (doc.exists) {
//                     const geoPoint = doc.data().location;
//                     const userLocation = {
//                         lat: geoPoint.latitude,
//                         lng: geoPoint.longitude
//                     };
//                     // Use this location in Mapbox
//                     addUserLocationToMap(userLocation);
//                 } else {
//                     console.log('No such document!');
//                 }
//             }).catch(function(error) {
//                 console.error('Error getting document:', error);
//             });
//         } else {
//             // No user is signed in
//             console.log('No user is signed in.');
//         }
//     });
// });

function addUserLocationsToMap(map) {

    // Reading information from "users" collection in Firestore
    db.collection('users').get().then(allUsers => {
        const features = []; // Defines an empty array for user locations

        allUsers.forEach(doc => {
            // Check if the user has valid location data
            if (doc.exists && doc.data().location != null && !isNaN(doc.data().location.latitude) && !isNaN(doc.data().location.longitude)) {
                // Extract coordinates of the user
                const coordinates = [doc.data().location.longitude, doc.data().location.latitude];
                console.log(coordinates);
                // Extract other fields you might want, e.g., username
                const userName = doc.data().name; // User's Name

                // Push user information (properties, geometry) into the features array
                features.push({
                    'type': 'Feature',
                    'properties': {
                        'description': `<strong>${userName}</strong>`
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates
                    }
                });
            }
        });

        // Adds user locations as features to the map
        map.addSource('user-locations', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': features
            }
        });

        // Creates a layer above the map displaying the user locations
        map.addLayer({
            'id': 'user-locations',
            'type': 'circle', // Visual style of the markers
            'source': 'user-locations',
            'paint': {
                'circle-color': '#ff6347', // Customize the color
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        // Add interactivity for the user location markers
        map.on('click', 'user-locations', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        map.on('mouseenter', 'user-locations', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'user-locations', () => {
            map.getCanvas().style.cursor = '';
        });
    });
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
            if (doc.exists && doc.data().location != null && !isNaN(doc.data().location.latitude) && !isNaN(doc.data().location.longitude)) {


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


