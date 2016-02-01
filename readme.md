![Logo](resources/logo/web_header_medium.png)

# Description

(This repository is part of the AEON platform and contains only the files related to the Events Manager)

AEON is a cloud platform to create applications with 
real time communications channels. The architecture is based on the strongly 
communication needs that we need to face nowadays, with billions of 
interconnected devices and short times of response. Thus, the technological 
solutions used for the implementation are based on strong requirements 
about: performance, response and scalability, making use of the most advanced 
cutting edge technologies.

AEON platform offers a shared cloud-based message queuing framework enabling messaging between various entities that wish to communicate with each other seamlessly and reliably using standard vendor neutral protocols

# Benefits 
 * Communicate applications and services through a real time network
 * Easy to use, easy to integrate in developments: AEON provides an SDK to connect your services and devices over a globally scaled real-time network
 *	Performance, Scalability and Reliability: High performance for message delivery and data exchange between business processes and devices and from device to device. AEON is able to handle multiple types and priorities of messages, whilst at the same time providing the necessary Quality of Service. AEON provides reliable messaging with durability and persistence and needs to scale well for extremely large volumes.
 *	Big Data: AEON can take care of the cloud messaging of the data capture from M2M environments and big data flows.

# Technical description

Online thecnical documentation can be [find here](http://130.206.116.137:3000/public/doc/html/apidoc/apidoc.html). If you are a developer and you are willing to beging coding with AEON, it would be better if you visit the [QuickStart guide](http://130.206.116.137:3000/public/doc/html/apidoc/apidoc.html#quick-start).
 
 In a nutshell, AEON should (publish/subcribe) be as easy as:
 
 Publish over a channel (snippet $2):  
 
 ```javascript
    sdk = new AeonSDK(channel.PUB_URL);
    msg = { "number": 1};
    sdk.publish(msg);
 ```
 
 Subscribe to a channel (snippet $3):
 
 ```javascript
 sdk = new AeonSDK(channel.SUB_URL, config.YOUR_ID , config.YOUR_DESC);
 sdk.subscribe(function(msg){ console.log(msg)});
```

# In Use

Currently AEON has been deployed in:

* iCargo European Project, implementing the called Logistic Cloud Bus to communicate the logistic entities living inside the iCargo ecosystem. You can access through this [url](http://aeon.atosresearch.eu). 

# License

Due the interoperability needs of these architectures, AEON has been fully
designed considering Free Libre Open Source Software technologies. 
The project has been designed and implemented by the Transport and Trade  Logistics Sector in the Research & Innovation department in ATOS Spain.

AEON Platform is released as Open Source.
