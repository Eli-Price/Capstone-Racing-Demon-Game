//const socket = io();  Dont need this unless there is a need for the socket on the home page.

const joinGameButton = document.getElementById('joinGameButton');

joinGameButton.addEventListener('click', () => {
  const roomID = document.querySelector('.input-field input').value;
  localStorage.setItem('roomID', roomID);
  console.log(`Joining room: ` + localStorage.getItem('roomID'));

  // Navigate to the game page
  window.location.href = `../pages/game.html`;
});