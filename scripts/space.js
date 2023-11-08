
const db = firebase.firestore();


const usersRef = db.collection('users');


let locationData = [];


usersRef.get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
   
    const userData = doc.data();
    locationData.push(userData.location); 
  });

  
  updateHTML(locationData);
}).catch((error) => {
  console.error("Error getting documents: ", error);
});

function updateHTML(locations) {
 
  let listHTML = '<ul>';

  
  locations.forEach((loc) => {
    listHTML += `<li>${loc}</li>`;
  });

  
  listHTML += '</ul>';

  
  document.getElementById('locationList').innerHTML = listHTML;
}
