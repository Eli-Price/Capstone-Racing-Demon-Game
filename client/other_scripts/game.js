//import { io } from "socket.io-client";

/*const socket = io();

socket.on('connect', () => {
 
})*/

var modal = document.getElementById('howToPlayModal');
var btn = document.getElementById('howToPlayButton'); // Ensure your "How to Play" button has this ID
var span = document.getElementsByClassName('close')[0]; // Gets the <span> element that closes the modal

btn.onclick = function() {
    modal.style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
      modal.style.display = "none";
  }
}