/**
    Copyright (C) 2014 ATOS
 
    This file is part of AEON.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
   
   
   Authors: Jose Gato Luis (jose.gato@atos.net)

*/

/*
 * This component is part of the AEON platform
 *
 * This component test the SocketIO subscription funcionalities
 *
 */


var config = require('./config/config.js');
var io = require('socket.io-client');


function subscribeMe(){

    var data = {}
    data.id = process.argv[3];
    data.desc = process.argv[4];
    data.subkey = process.argv[2];
    console.log("Sending subscription request");
    socket.emit('subscribeQueue', data);

}
function deliveredMessage(data, socket, msgCount) {
    console.log("message received (", msgCount, ") ",  JSON.stringify(data));

}

var listenerDeliveredMessage = undefined;
var listenerControl = undefined;
waiting = false;

function control(data, msgCount) {

    console.log("new control message ", data);
    if ( (data.code == 250) && (data.error == false)){
        console.log("OK subscription ok, lets listen for messages");

        socket.on("message-" + process.argv[2], listenerDeliveredMessage = function(data){

            deliveredMessage(data, socket, msgCount);
            msgCount++;
            if (msgCount == 5){
                waiting = true;
                msgCount = 0;
                var data = {}
                data.id = process.argv[3];
                data.subkey = process.argv[2];
                socket.emit('unSubscribeQueue', data);

                //socket.removeListener("message-" + process.argv[2], listenerDeliveredMessage);
                // While the server receives the unsubscribe, it could happen
                // that some messages could have been delivered from the broker
                // So there is a gap of time until the unsubscribe is completed
                // with delivered messages, that we should receive.

                console.log("Lets pause the connection 5 sec");
                setTimeout(function() {
                    console.log("OK, lets continue");
                    if (waiting){
                        //socket.removeListener("message-" + process.argv[2], listenerDeliveredMessage);
                        subscribeMe();
                    } else
                        console.log("upss something happened during my sleep, better dont re-subscribe");
                    // if waiting == false something interrupted my sleep
                    // so better I dont re-subscribe
                    waiting = false;
                }, 5000);

            }
        });


    } else if (data.code == 204) {
        //socket.removeListener("message-" + process.argv[2], listenerDeliveredMessage    );
        //socket.disconnect();
        console.log("Queue in use");
    } else if (data.code == 450) { //unsubscribed
        //socket.removeListener("message-" + process.argv[2], listenerDeliveredMessage    );
        socket.removeListener("message-" + data.msg, listenerDeliveredMessage);
        console.log("Unsubscribed confirmed");
    }
}

if (process.argv.length != 5) {
    // pub_key could be retrieved through mongo, but..
    console.log(" Usage: node clienttest.js sub_key id desc");
    return;
} else {

    //socket = io.connect('http://localhost:7789');
    socket = io.connect('http://lcb-sub.herokuapp.com');
    socket.once('connect', function connectionStablished() {

        console.log("Connected to AEON subscription service");


        socket.on('control', listenerControl = function listenerControl(data){
            var msgCount = 0;
            control(data, msgCount);
        });

        subscribeMe();


    });


    socket.on('disconnect', function disconnect() {
        console.log("Disconnected");
        socket.removeListener("message-" + process.argv[2], listenerDeliveredMessage    );

        socket.removeListener("control", listenerControl);
        waiting = false;

    });

    socket.on("reconnect", function reconnecting(transport_type,reconnectionAttempts){
        console.log("reconnect: ", transport_type,reconnectionAttempts);
        console.log("waiting ", waiting);
        if (!waiting){
            socket.once('connect', function connectionStablished() {

                console.log("Connected to AEON subscription service");


                socket.on('control', listenerControl = function listenerControl(data){
                    var msgCount = 0;
                    control(data, msgCount);
                });



                subscribeMe();
            });
        }



    });


}