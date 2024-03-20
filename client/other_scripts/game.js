//import { io } from "socket.io-client";
//import Cookies from 'js-cookie';

const socket = io();

socket.on('connect', () => {
  //const roomId = Cookies.get('roomId')
  const roomId = localStorage.getItem('roomId');
  socket.emit('joinRoom', roomId); 
})