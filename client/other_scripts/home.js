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
      let errorMessage = document.createElement('p');
      errorMessage.textContent = response.message;
      //document.querySelector('.input-field').appendChild(errorMessage);
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
      let errorMessage = document.createElement('p');
      errorMessage.textContent = response.message;
      //document.querySelector('.input-field').appendChild(errorMessage);
    }
  });

  console.log('Room Created: ' + localStorage.getItem('roomID'));
});