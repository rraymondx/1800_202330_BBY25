var otherUser;
var currentUser;

// Function to populate name elements with a given user name
function populateNameClassElements(userName) {
    var nameElements = document.getElementsByClassName('name-goes-here');
    for (let i = 0; i < nameElements.length; i++) {
        nameElements[i].innerHTML = userName;
    }
}

// Event listener for the 'openFormButton' click
document.getElementById('openFormButton').addEventListener('click', function () {
    document.getElementById('moodForm').style.display = 'flex';
});

// Event listener for the 'moodFormContent' submit
document.getElementById('moodFormContent').addEventListener('submit', function (event) {
    event.preventDefault();

    let mood = document.getElementById('mood').value;
    let explanation = document.getElementById('moodExplanation').value;

    // Get the currently signed-in user
    user = firebase.auth().currentUser;

    if (user) {
        // User is signed in, proceed to store the mood
        db.collection('moods').add({
            userId: user.uid,  // Add the user's UID to link the mood to the user
            mood: mood,
            explanation: explanation,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Optional: add a server timestamp
        })
            .then(function (docRef) {
                console.log("Document written with ID: ", docRef.id);
                document.getElementById('moodForm').style.display = 'none';
                document.getElementById('moodFormContent').reset();
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
    } else {

        console.log("No user is signed in.");

    }
});

let map; 
let isPopupOpen = false;
let currentPopup = null;

// Function to add user locations to a map
function addUserLocationsToMap() {

    loadInitialUserMoods();

   
    db.collection('moods').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
                let moodData = change.doc.data();
               
                updateUserMoodOnMap(moodData);
            }
        });
    });

    
    attachMapEventListeners();
}

// Function to load initial user moods
function loadInitialUserMoods() {
    db.collection('users').get().then(allUsers => {
        allUsers.forEach(userDoc => {
            // Set up a real-time listener for each user's latest mood
            db.collection('moods')
                .where('userId', '==', userDoc.id)
                .orderBy('timestamp', 'desc')
                .limit(1)
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added' || change.type === 'modified') {
                            let moodData = change.doc.data();
                            updateUserMoodOnMap(moodData);
                        }
                    });
                });
        });
    }).catch(error => {
        console.error("Error loading user moods: ", error);
    });
}

// ---------------------------
// Retrieves the users rating. 
// ---------------------------
async function getUserAverageRating(userId) {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();
    if (doc.exists && doc.data().averageRating !== undefined) {
        return doc.data().averageRating.toFixed(2); // Assuming averageRating is a number
    } else {
        return "No ratings yet"; // Default text if no ratings
    }
}

// ----------------------------------
// Updates the users data on the map.
// ----------------------------------
function updateUserMoodOnMap(moodData) {
    // Get the user's location and update or add the mood on the map
    db.collection('users').doc(moodData.userId).onSnapshot(doc => {
        if (doc.exists) {
            let userData = doc.data();
            if (userData.location) {
                let coordinates = [userData.location.longitude, userData.location.latitude];
                updateMapSource(coordinates, userData, moodData);

                let moodTimestamp = moodData.timestamp.toMillis(); // Convert Firestore timestamp to milliseconds
                let fiveMinutesAgo = Date.now() - (5 * 60 * 1000); // 5 minutes ago in milliseconds
                if (moodTimestamp > fiveMinutesAgo) {
                    // Fetch the average rating and then create the popup
                    getUserAverageRating(moodData.userId).then(averageRating => {
                        let popupContent = `<strong>${userData.name} <br> Mood: ${moodData.mood}<br> Explanation: ${moodData.explanation}<br>Average Rating: ${averageRating}`;
                        let popup = new mapboxgl.Popup({ offset: 25 })
                            .setLngLat(coordinates)
                            .setHTML(popupContent)
                            .addTo(map);
                        setTimeout(function () {
                            popup.remove();
                        }, 15000); // 60000 milliseconds = 1 minute
                    }).catch(error => {
                        console.error("Error getting average rating: ", error);
                    });
                }
            }
        }
    });
}

// Function to create a message chain between users
function replyToUser(otherUserId) {
    // Get the currently signed-in user
    currentUserId = firebase.auth().currentUser.uid;
    if (currentUserId != otherUserId) {
        createNewMessage(currentUserId, otherUserId);
    } else {
        window.alert("Cannot message with yourself!");
        console.log("Cannot message with yourself!");
    }
}

// Function to update the map source with user mood data
function updateMapSource(coordinates, userData, moodData) {
    let source = map.getSource('user-locations');
    if (source) {
        // Obtain the data object from the source to modify it
        let data = source._data;

        // Check if the feature for the user already exists
        let featureIndex = data.features.findIndex(feature => feature.properties.userId === moodData.userId);
        if (featureIndex !== -1) {
            // Update the existing feature's properties
            data.features[featureIndex].properties.mood = moodData.mood;
            data.features[featureIndex].properties.moodExplanation = moodData.explanation;
        } else {
            // Add a new feature to the data object for the new mood
            data.features.push({
                'type': 'Feature',
                'properties': {
                    'userId': moodData.userId,
                    'description': userData.name,
                    'mood': moodData.mood,
                    'moodExplanation': moodData.explanation
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': coordinates
                }
            });
        }

        // After modifications, set the new data on the source
        source.setData(data);
    } else {
        // If the source doesn't exist, create it with the initial mood data
        map.addSource('user-locations', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'properties': {
                        'userId': moodData.userId,
                        'description': userData.name,
                        'mood': moodData.mood,
                        'moodExplanation': moodData.explanation
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates
                    }
                }]
            }
        });

        // Also create a new layer for the source
        map.addLayer({
            'id': 'user-locations',
            'type': 'circle',
            'source': 'user-locations',
            'paint': {
                'circle-color': '#87CEEB',
                'circle-radius': 12,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });
    }
}

// Function to attach event listeners to the map
function attachMapEventListeners() {
    // When a user location is clicked, open the popup with details including average rating
    map.on('click', 'user-locations', (e) => {
        if (e.features.length > 0) {
            const properties = e.features[0].properties;
            const userName = properties.description;
            const userMood = properties.mood;
            const userId = properties.userId;
            const moodExplanation = properties.moodExplanation;

            // Close any existing popups
            if (currentPopup) {
                currentPopup.remove();
            }

            // Fetch the average rating and then create the popup
            getUserAverageRating(userId).then(averageRating => {
                // Now we have the average rating, we can create the popup content
                const popupContent = `<strong>${userName}</strong><br>Mood: ${userMood}<br>Explanation: ${moodExplanation}<br>Average Rating: ${averageRating}<br><button onclick="replyToUser('${userId}')">Connect with User</button>`;
                currentPopup = new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(map);

                map.getCanvas().style.cursor = 'pointer';
                isPopupOpen = true;

                currentPopup.on('close', () => {
                    isPopupOpen = false;
                    currentPopup = null;
                });
            }).catch(error => {
                console.error("Error getting average rating: ", error);
            });
        }
    });

    // When the map is clicked outside of 'user-locations', close any open popups
    map.on('click', () => {
        if (!isPopupOpen && currentPopup) {
            map.getCanvas().style.cursor = '';
            currentPopup.remove();
            currentPopup = null;
        }
    });

    // Additional event listeners (e.g., 'mouseenter', 'mouseleave') can be added here as needed
}

// Function to display the map
function showMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';

    // Check if geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            // Use current position to set map center
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 15 // Zoom closer for a more detailed view
            });

            // Add map controls and load user locations
            map.addControl(new mapboxgl.NavigationControl(), 'top-left');
            map.on('load', addUserLocationsToMap);

        }, error => {
            console.error("Error getting user's location: ", error);
            // Fallback to a default location if geolocation is not available
            initializeMapWithDefaultLocation();
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        // Fallback to a default location if geolocation is not supported
        initializeMapWithDefaultLocation();
    }
}

// Function to initialize the map with a default location
function initializeMapWithDefaultLocation() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.964274, 49.236082], // Default center
        zoom: 30, // Default zoom
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    map.on('load', addUserLocationsToMap);
}

// Call the showMap function to display the map
showMap();

// Get a reference to the 'deleteButton' element and add a click event listener
const deleteButton = document.getElementById('deleteButton');

deleteButton.addEventListener('click', function (event) {
    // Get the user ID from the currently logged-in user
    const userId = firebase.auth().currentUser.uid;
    db.collection('moods')
        .where('userId', '==', userId)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                console.log(doc.id, " => ", doc.data());
                db.collection('moods').doc(doc.id).delete().then(() => {
                    console.log("Document successfully deleted!");
                    window.alert("delete success");
                    location.reload();
                }).catch(error => {
                    console.error("Error removing document: ", error);
                });
            });
        })
        .catch(error => {
            console.log("Error getting documents: ", error);
        });
});



