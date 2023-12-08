// ------------------------------------------
// Given the user collection, get their icon.
// Return as a string.
// ------------------------------------------
async function getUserProfileIcon(user) {
    const doc = await user.get();  
    return doc.data().picture;
}

// ------------------------------------------
// Given the user collection, get their name.
// Return as a string.
// ------------------------------------------
async function getUserProfileName(user) {
    const doc = await user.get();
    return doc.data().name;
}
