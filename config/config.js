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
 * Just exports differnt configuration files regarding cofigured
 * environment.
 *
 * each module with cofiguration has to provide a cofig file in the
 * way of:
 *   at least modulename-development.js and then n modulename-{ENV}.js
 *
 * supported configuration environments:
 *   development
 *   production
 *
 */


var env = process.env.NODE_ENV || 'development'

config = {};
config.app = require('./app-' + env);


// broker connector configuration:
config.connectorBroker = require('./brokerconnector-' + env);

// db connector configuration;
config.db = require('./db-' + env);

module.exports = config;
