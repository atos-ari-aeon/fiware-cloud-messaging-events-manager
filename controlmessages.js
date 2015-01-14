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
 * This class covers functionality to manage the control messages between client
 * and server
 */

/*
 * Generic
 *
 */
exports.INTERNAL_ERROR = new Error("Internal Error");
exports.INTERNAL_ERROR.error = true;
exports.INTERNAL_ERROR.code = 101;
exports.INTERNAL_ERROR.msg = "Internal Error, ask for support";

exports.INFRASTRUCTURE_UP = new Error("Infrastructure up");
exports.INFRASTRUCTURE_UP.error = false;
exports.INFRASTRUCTURE_UP.code = 102;
exports.INFRASTRUCTURE_UP.msg = "Communication infrastructure up";

exports.INFRASTRUCTURE_DOWN = new Error("Infrastructure down");
exports.INFRASTRUCTURE_DOWN.error = true;
exports.INFRASTRUCTURE_DOWN.code = 103;
exports.INFRASTRUCTURE_DOWN.msg = "Communication infrastructure down";
/*
 * Queue related
 *
 */
exports.QUEUE_NOT_FOUND = new Error("Queue not found in the broker");
exports.QUEUE_NOT_FOUND.error = true;
exports.QUEUE_NOT_FOUND.code = 201;
exports.QUEUE_NOT_FOUND.msg = "Queue not found in the broker";

exports.QUEUE_EMPTY_NAME = new Error("Bad Request: No queue name");
exports.QUEUE_EMPTY_NAME.error = true;
exports.QUEUE_EMPTY_NAME.code = 202;
exports.QUEUE_EMPTY_NAME.msg = "Bad Request: No queue name";

exports.QUEUE_NOT_CREATED = new Error("Bad Request: No queue created");
exports.QUEUE_NOT_CREATED.error = true;
exports.QUEUE_NOT_CREATED.code = 203;
exports.QUEUE_NOT_CREATED.msg = "Bad Request: No queue created";

exports.QUEUE_EXCLUSIVE_SUBSCRIBE = new Error("Queue in use");
exports.QUEUE_EXCLUSIVE_SUBSCRIBE.error = true;
exports.QUEUE_EXCLUSIVE_SUBSCRIBE.code = 204;
exports.QUEUE_EXCLUSIVE_SUBSCRIBE.msg = "Queue in use";

exports.QUEUE_SUBSCRIBED = new Error("You have been subscribed");
exports.QUEUE_SUBSCRIBED.error = false;
exports.QUEUE_SUBSCRIBED.code = 250;
exports.QUEUE_SUBSCRIBED.msg = "You have been subscribed";

exports.QUEUE_DELETED = new Error("Your subscription has been deleted");
exports.QUEUE_DELETED.error = false;
exports.QUEUE_DELETED.code = 251;
exports.QUEUE_DELETED.msg = "Your subscription has been deleted";

/*
 * Request
 *
 */
exports.REQUEST_ERROR = new Error("Bad Request");
exports.REQUEST_ERROR.error = true;
exports.REQUEST_ERROR.code = 301;
exports.REQUEST_ERROR.msg = "Bad Request";


/*
* Subscriptions
*/

exports.NOT_SUBSCRIBED = new Error("Not subscribed");
exports.NOT_SUBSCRIBED.error = true;
exports.NOT_SUBSCRIBED.code = 401;
exports.NOT_SUBSCRIBED.msg = "You are not subscribed";

exports.ALREADY_SUBSCRIBED = new Error("Already subscribed");
exports.ALREADY_SUBSCRIBED.error = true;
exports.ALREADY_SUBSCRIBED.code = 402;
exports.ALREADY_SUBSCRIBED.msg = "You are already subscribed";


exports.UNSUBSCRIBED = new Error("Unsubscribed");
exports.UNSUBSCRIBED.error = false;
exports.UNSUBSCRIBED.code = 450;
exports.UNSUBSCRIBED.msg = ""; //to be filled with the queue name
