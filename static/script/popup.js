// function addFriend(friendId) {
//     fetch(`/addfriend/${friendId}`, {
//         method: 'POST', 

//     })

//     .then(response =>{
//         if (!response.ok) {
//             throw new Error ('Network response was not ok')

//         }
//         return response.json()

//     })
//     .then(data => {
//         console.log(data.message)
//         window.alert(data.message)
//     })

//     .catch(error => {
//         console.error('Error adding friend:', error)
    
//     })
// }