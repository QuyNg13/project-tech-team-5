async function fetchFriends() {
    try {
        const response = await fetch('/friends');
        const friends = await response.json();

        const friendsList = document.getElementById('friends-list');
        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.innerHTML = `
                <img src="${friend.profilePic}" alt="${friend.username} Profile Picture">
                <p>${friend.username}</p>
            `;
            friendsList.appendChild(friendElement);
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
}

fetchFriends();