async function getUserProfileIcon(user) {
    const doc = await user.get();  
    return doc.data().picture;
}