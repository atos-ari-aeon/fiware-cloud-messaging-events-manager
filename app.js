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
 * This component exposes subscription mechanisms to
 * the rabbitMQ server through a SocketIO connection
 *
 */

/* jslint node: true */

var config = require('./config/config.js');
var Broker = require('broker-manager');
var BrokerConnector = Broker.BrokerConnector;
var BrokerManager = Broker.BrokerManager;
var AEONChannel = Broker.Channel;
var controlMessages = require('./controlmessages.js');
var logger = require('./logger.js');
var express = require('express');
var moment = require('moment');
var app = express();

if ((config.app.SSL != undefined) && (config.app.SSL == true)){
    var fs = require('fs');
    var server_options = {key: fs.readFileSync(config.app.key), cert: fs.readFileSync(config.app.cert)};
    var server = require('https').createServer(server_options, app);
}else
    var server = require('http').createServer(server_options, app);

var io = require('socket.io').listen(server,  { log: true });

var brokerConnector = new BrokerConnector(config.connectorBroker);
var brokerConnection = brokerConnector.connect();

var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;



options = {}
options.safe = true;
options.logger = {};
options.logger.doDebug = true;

var mongoClient = new MongoClient(new Server(config.db.host, config.db.port), options);

var dbAEON = undefined;
var dbLogs = undefined;

//ToDo: We should study best options in production
//io.set("heartbeat timeout", 10);
//io.set("heartbeat interval", 5);

//by the momment lets configure only with xhr-polling, others
//are giving problems with heroku


//recommended production configuration

io.configure("heroku", function () {
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 3);                    // reduce logging
    io.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket'
        , 'flashsocket'
        , 'htmlfile'
        , 'xhr-polling'
        , 'jsonp-polling'
    ]);
});

mongoClient.open(function(err, mongoClient) {

    if (err) {
        logger.error(err);
        throw err;
    }

    dbAEON = mongoClient.db(config.db.db);
    if (config.db.username != "") {
        dbAEON.authenticate(config.db.username, config.db.password, function(err, result) {
            if (err) {
                logger.error(err);
                throw err;
            }
            logger.info("AEON DB connected (authenticated");
            //obj.setClient(dbAEON);
            dbLogs = dbAEON.collection(config.db.collectionLogs);
        });

    } else{
        dbLogs = dbAEON.collection(config.db.collectionLogs);
        logger.info("AEON DB connected");
    }



});


var brokerManager = new BrokerManager(brokerConnector);

brokerConnection.connected = false;
brokerConnection.once('ready', function() {
    brokerConnection.connected = true;

    logger.info("connected to rabbitmq");

    io.sockets.on('connection', function(client) {

        logger.info("New connection for client ", client.id);
        if (brokerConnection.connected == true)
            client.emit('control', controlMessages.INFRASTRUCTURE_UP);
        else
            client.emit('control', controlMessages.INFRASTRUCTURE_DOWN);

        // access to this variable should concurrence protected
        client.subscription = {};

        /*
         * To create a subscription to an existing queue in the broker.
         * @data: should include an attribute queueName with an existing queue
         *
         * return:
         *   xxx - Bad Request
         *   xxx - You are already subscribed
         *   xxx - The queue does not exits
         *
         */
        client.on('subscribeQueue', function manageSubscriptions(data) {
            var subscription = data;
            if ( (subscription == null) || (typeof subscription != "object") || ( !["id", "desc", "subkey"] in subscription)) {
                client.emit("control", controlMessages.REQUEST_ERROR);
                return;
            }


            exitsSubscription(subscription, function(error) {

                if (error){
                    sendError(error, client);
                    return;
                }

                if (subscription.subkey == client.subscription.queue){
                    client.emit("control", controlMessages.ALREADY_SUBSCRIBED);
                    return;
                }

                logger.info("Request for subscription in the queue ", subscription.subkey, " for client ", client.id);
                logger.info("Current managed subscriptions: ", client.subscription);

                var channel = new AEONChannel("");
                channel.setSubKey(subscription.subkey);

                var subscriptionClient = client;

                brokerManager.subscribe(channel, function controlSubscription(error, ctag) {

                    logger.info("Inside subscribe with client ", client.id);
                    if (error) 
                        sendError(error, client);
                    else {
                        // ctag could be used to emit trough message-ctag
                        logger.info("Subscribed ok, ctag " + ctag, " for client", client.id);

                        // possible concurrency issues
                        // ToDo: To protect access to this variable
                        client.subscription = { queue: channel.getSubKey(), ctag: ctag};
                        client.emit("control", controlMessages.QUEUE_SUBSCRIBED);
                        logger.info("Current managed subscriptions after new request: ", client.subscription);

                    }
                }.bind({i:subscriptionClient}),function deliveryMessage(message) {
                    logger.info("Incoming message, delivering");
                    if (client.disconnected) {
                        logger.info("Upppps: Client disconnected");
                        closeSubscriptions(client);

                    } else{
                        //Log the message in the DDBB and emit to the client
                        //ToDo: logging should be optional ;-)
                        var log = {
                            "message": message,
                            "timestamp": moment().format("MM-DD-YYYY HH:mm:ss"),
                            "subscription": subscription
                        }
                        dbLogs.insert(log, function(err, docs) {
                            if (err)
                                logger.error("Not logged message: " + log);

                        });
                        client.emit("message-" + data.subkey, message);

                    }
                });

            });
        });

        client.on('disconnect', function(data){

            /*
             * possible to miss messages
             * if someone publish messages
             * in the time from the client tryng to dissconnect
             * to the unsubscribe process
             * this messages will be lost
             * Maybe we need to ack messages
             *
             */

            logger.info("Received end from client ", client.id);
            if ( "queue" in client.subscription)
                closeSubscriptions(client);
            logger.info("Active subscriptions for the client: ", client.id, client.subscription);


        });

        /*
         * Unsubscribe
         */

        client.on('unSubscribeQueue', function(data) {
            /*
             * To test:
             *
             * 1- The queue exists and it is correct
             * 2- You are not subscribed to the queue
             *
             */

            if (typeof data != "object") {
                client.emit("control", controlMessages.REQUEST_ERROR);
                return;
            }

            logger.info("***Unsubscribing request from ", client.id, "current subscriptions managed: ", client.subscription);

            if(data == null || data == undefined)
                client.emit("control", controlMessages.REQUEST_ERROR);
            else if ( data.subkey != client.subscription.queue)
                client.emit("control", controlMessages.NOT_SUBSCRIBED);
            else{
                closeSubscriptions(client);
            }


        });


    });
}).on("error", function socketServerErrors(error) {

    logger.error("SocketIO Server Global error ", error);
    switch (error.code) {
        case 320: //conection from rabbit down
            brokerConnection.connected = false;
            io.sockets.emit("control", controlMessages.INFRASTRUCTURE_DOWN);
            brokerConnection.once('ready', function brokerReadyAgain() {
                brokerConnection.connected = true;
                logger.info("re-connected to rabbit server ");
                io.sockets.emit("control",  controlMessages.INFRASTRUCTURE_UP);
            })
            break;
    }
});



server.listen(config.app.port, function() {

    logger.info("server ready")
});



function exitsSubscription(subscription, next){
    var collection = dbAEON.collection(config.db.collectionEntities);

    collection.find( { "channels.subscriptions":
                      { $elemMatch : {"id" : subscription.id, "desc": subscription.desc, "subkey": subscription.subkey }}}
                   ).toArray(function(error, docs){
        if (error) {
            next(controlMessages.SUBSCRIPTIONS_NOT_EXITS);
        };

        if (docs.length == 0)
            next (controlMessages.SUBSCRIPTIONS_NOT_EXITS);
        else {
            if (docs.length > 1)
                logger.error("Something uggly happens: more than one subscription with same id");
            next(null);
        }
    });
}

/*
 * This function translate broker errors
 * to proper subscription errors
 *
 */
var sendError = function sendError(error, client){

    switch (error.code) {

        case 801:
            logger.error("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.QUEUE_NOT_FOUND);
            break;
        case 802:
            logger.error("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.QUEUE_NOT_CREATED);
            break;
        case 805:
            logger.error("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.NOT_SUBSCRIBED);
            break;
        case 807:
            logger.error("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.QUEUE_EXCLUSIVE_SUBSCRIBE);
            break;
        case 808:
            logger.error("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.QUEUE_EXCLUSIVE_SUBSCRIBE);
            break;
        case 809:
            logger.error("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.INTERNAL_ERROR);
            break;

        case 810: //queue was deleted
            logger.info("Queue ", error, " with code ", error.code);
            client.emit("control", controlMessages.QUEUE_DELETED);
            break;
        case 407:
            logger.error("Subscription error ", error, " with code ", error.code);
            client.emit("control", (controlMessages.QUEUE_EMPTY_NAME));
            break;

        default:
            logger.error("Subscription error ", error, " with code ", error.code);
            client.emit("control", controlMessages.INTERNAL_ERROR);
            break;
    }
}

var closeSubscriptions = function closeSubscriptions(client){
    //ToDo: access to ctags should be concurrency protected


    var channel = new AEONChannel("");
    channel.setSubKey(client.subscription.queue);

    logger.info("closing ", client.subscription.queue );
    brokerManager.closeQueue(channel, function closeQueue(error){

        if (error) {
            sendError(error, client);
            if (error.code == 805){
                logger.error("=========");
                logger.error("ok, trying to close ", client.subscription.queue, " ", client.subscription.ctag);
                logger.error("but it seems is not open");

            }
        } else {
            client.subscription = {}
            var message = controlMessages.UNSUBSCRIBED;
            message.msg = client.subscription.queue;
            client.emit("control", message);
            logger.info("***Unsubscribing request from ", client.id, " processed, current subscriptions managed: ", client.subscription);

        }
    });

}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};



