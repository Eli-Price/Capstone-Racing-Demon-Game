const socket = io({
  auth: { 
     userID: localStorage.getItem('userID'),
     roomID: localStorage.getItem('roomID')
  }
});

let roomID = localStorage.getItem('roomID');
let userID = localStorage.getItem('userID'); //Math.floor(Math.random() * 1000000);

document.getElementById('joinGameButton').addEventListener('click', () => {
  roomID = document.querySelector('.input-field input').value;
  if (localStorage.getItem('userID') === null) {
    userID = socket.id;
  }
  localStorage.setItem('roomID', roomID);
  localStorage.setItem('userID', userID);
  console.log(`Attempting to join room: ` + localStorage.getItem('roomID'));

  // Emit the 'joinGame' event and wait for a response from the server
  socket.emit('joinGame', { roomID }, (response) => {
    if (response.success) {
      // If the server responded with success, navigate to the game page
      window.location.href = `../pages/game.html`;
    } else {
      // If the server responded with an error, display the error message
      showErrorPopup(response.message);
    }
  });
});

document.getElementById('createGameButton').addEventListener('click', () => {
  roomID = document.querySelector('.input-field input').value;
  if (localStorage.getItem('userID') === null) {
    userID = socket.id;
  }
  localStorage.setItem('roomID', roomID);
  localStorage.setItem('userID', userID);
  socket.emit('createGame', { roomID });
  socket.emit('joinGame', { roomID }, (response) => {
    if (response.success) {
      // If the server responded with success, navigate to the game page
      window.location.href = `../pages/game.html`;
    } else {
      // If the server responded with an error, display the error message
      showErrorPopup(response.message);
    }
  });

  console.log('Room Created: ' + localStorage.getItem('roomID'));
});

function showErrorPopup(message) {
  // Create the popup and the dismiss button
  let popup = document.createElement('div');
  let button = document.createElement('button');

  // Set the popup message and button text
  popup.textContent = message;
  button.textContent = 'Dismiss';

  // Add a click event listener to the button to remove the popup
  button.addEventListener('click', () => {
    popup.remove();
  });
  
  // Style the button
  button.style.marginTop = '10px';

  // Style the popup
  popup.style.position = 'fixed';
  popup.style.zIndex = '1000';
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.backgroundColor = '#f8d7da';
  popup.style.border = '1px solid #f5c6cb';
  popup.style.padding = '20px';
  popup.style.borderRadius = '5px';
  popup.style.width = '200px';
  popup.style.textAlign = 'center';
  popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

  // Append the button to the popup and the popup to the body
  popup.appendChild(button);
  document.body.appendChild(popup);
}