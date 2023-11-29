var otherUser;
var currentUser;

function populateNameClassElements(userName) {
    var nameElements = document.getElementsByClassName('name-goes-here');
    for (let i = 0; i < nameElements.length; i++) {
        nameElements[i].innerHTML = userName;
    }
}

document.getElementById('openFormButton').addEventListener('click', function () {
    document.getElementById('moodForm').style.display = 'flex';
});


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
// Existing functions: populateNameClassElements, getNameFromAuth, etc...


// Global variables for map interactions
let map; // Will hold the reference to the Mapbox map object
let isPopupOpen = false;
let currentPopup = null;

function addUserLocationsToMap() {
    // Initially load the users and their moods
    loadInitialUserMoods();

    // Set up a real-time listener for the moods to update them as they change
    db.collection('moods').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
                let moodData = change.doc.data();
                // Call a function to update the mood on the map
                updateUserMoodOnMap(moodData);
            }
        });
    });

    // Attach event listeners for mouse enter and leave on the map
    attachMapEventListeners();
}

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

async function getUserAverageRating(userId) {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();
    if (doc.exists && doc.data().averageRating !== undefined) {
        return doc.data().averageRating.toFixed(2); // Assuming averageRating is a number
    } else {
        return "No ratings yet"; // Default text if no ratings
    }
}

// ...
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
// ...


// -----------------------------------------------
// Creates a new message chaine between the users.
// -----------------------------------------------
function replyToUser(otherUserId) {
    // Get the currently signed-in user
    currentUserId = firebase.auth().currentUser.uid;
    if (currentUserId != otherUserId) {
        createNewMessage(currentUserId, otherUserId);
    } else {
        console.log("Cannot message with yourself!");
    }
}

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

showMap();

const deleteButton = document.getElementById('deleteButton');

deleteButton.addEventListener('click', function (event) {
    // Initialize Firestore

    // Get the user ID from the currently logged-in user
    // This assumes you have authentication set up and can get the current user's ID
    const userId = firebase.auth().currentUser.uid;

    // Now we need to find the moodId associated with this userId.
    // This is a two-step process: first, we query for the mood document(s),
    // then we delete the document(s) found.
    // The exact query depends on how your moods are structured in relation to the userId.

    db.collection('moods')
        .where('userId', '==', userId)
        // If there are multiple moods per user and you need to determine which one to delete,
        // you may need additional logic to select the correct moodId.
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                // Assuming we want to delete the mood document we found.
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



