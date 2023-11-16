async function getUserProfileIcon(user) {
    const doc = await user.get();  
    return doc.data().picture;
}

async function getUserProfileName(user) {
    const doc = await user.get();
    return doc.data().name;
}