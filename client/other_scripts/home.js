//const socket = io();  Dont need this unless there is a need for the socket on the home page.

const joinGameButton = document.getElementById('joinGameButton');

joinGameButton.addEventListener('click', () => {
  const roomId = document.querySelector('.input-field input').value;
  localStorage.setItem('roomId', roomId);
  console.log(`Joining room ${roomId}`);

  // Navigate to the game page
  window.location.href = `../pages/game.html`;
});