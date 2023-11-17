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

document.getElementById('openFormButton').addEventListener('click', function() {
    document.getElementById('moodForm').style.display = 'flex';
});

document.getElementById('moodFormContent').addEventListener('submit', function(event) {
    event.preventDefault();

    var mood = document.getElementById('mood').value;
    var explanation = document.getElementById('moodExplanation').value;

    // Get the currently signed-in user
    var user = firebase.auth().currentUser;

    if (user) {
        // User is signed in, proceed to store the mood
        db.collection('moods').add({
            userId: user.uid,  // Add the user's UID to link the mood to the user
            mood: mood,
            explanation: explanation,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Optional: add a server timestamp
        })
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            document.getElementById('moodForm').style.display = 'none';
            document.getElementById('moodFormContent').reset();
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    } else {
        
        console.log("No user is signed in.");
        
    }
});

let isPopupOpen = false; // Flag to track popup interaction
let currentPopup = null; // Global variable to hold the current popup
let currentUser = null; // Variable to track the user of the current popup

function addUserLocationsToMap(map) {
    // First get the users
    db.collection('users').onSnapshot(allUsers => {
        // Then get the moods, ordered by timestamp
        db.collection('moods').orderBy('timestamp', 'desc').get().then(allMoods => {
            // Create a map of userIds to their latest mood
            const userMoods = new Map();
            allMoods.forEach(moodDoc => {
                const moodData = moodDoc.data();
                // If the user's mood is not already in the map (thus ensuring we only get the latest mood)
                if (!userMoods.has(moodData.userId)) {
                    userMoods.set(moodData.userId, moodData);
                }
            });

            // Map over the user documents to create features
            const features = allUsers.docs.map(userDoc => {
                const userData = userDoc.data();
                if (userData.location) { // Check if location data exists
                    const userMoodData = userMoods.get(userDoc.id); // Get the mood data using the user's document ID
                    const coordinates = [userData.location.longitude, userData.location.latitude];
                    return {
                        'type': 'Feature',
                        'properties': {
                            'description': userData.name,
                            'mood': userMoodData ? userMoodData.mood : 'Mood not set', // Use the mood if available
                            'moodExplanation': userMoodData ? userMoodData.explanation : 'No explanation provided' // Use the explanation if available
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates
                        }
                    };
                }
                return null; // Return null for documents without location
            }).filter(feature => feature !== null); // Filter out null values

            if (features.length > 0) {
                // If a source with the same ID exists, replace its data
                if (map.getSource('user-locations')) {
                    map.getSource('user-locations').setData({
                        'type': 'FeatureCollection',
                        'features': features
                    });
                } else {
                    // Otherwise, add the new source
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
                }
            } else {
                console.log('No features to add to the map.');
            }
        }).catch(error => {
            console.error("Error getting moods' data: ", error);
        }); // End of 'then' for moods
    }); // End of 'then' for users

    map.on('mouseenter', 'user-locations', (e) => {
        if (e.features.length > 0) {
            const properties = e.features[0].properties;
            const userName = properties.description;
            const userMood = properties.mood;
            const moodExplanation = properties.moodExplanation;

            // Close any existing popups
            if (currentPopup) {
                currentPopup.remove();
            }

            // Create a new popup with the mood and explanation
            currentPopup = new mapboxgl.Popup({ offset: 25 })
                .setLngLat(e.lngLat)
                .setHTML(`<strong>${userName}</strong><br>Mood: ${userMood}<br>Explanation: ${moodExplanation}`)
                .addTo(map);

            map.getCanvas().style.cursor = 'pointer';
            currentUser = userName;
            isPopupOpen = true;

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
            currentUser = null;
        }
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


