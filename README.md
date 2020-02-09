OpenVPN_easyinstall
===================

Python3+ based OpenVPN 2.X configurator &amp; installer<br>.
*(Requires Linux/Unix due to the dependencies)*

Intention with Easy-Install
============

 - Manage one or multiple OpenVPN configurations.
 - Generate CA certificates via vanilla python-OpenSSL *(Not using easy-rsa or subprocess anymore)*
 - Generate server and client certificates.
 - Configure and manage IP's and routes *(optionally live while running)*.
 - Generate one-time-use config/certificate download links.

TODOs
=====

Make the identity manager optional, for now it works for debugging/testing but not for the general public.
A lot of things heh, reworking this from a simple pythons script into a more useable web-application.

Installation
=======

```bash
$ git clone --recurse-submodules -j8 https://github.com/Torxed/OpenVPN_easyinstall.git
```

All dependencies are submodules of this library.<br>
All of which can be found in my repo's, they are:

 * [slimHTTP](https://github.com/Torxed/slimHTTP.git) - HTTP(S) webserver with modular method requests and upgraders
 * [spiderWeb](https://github.com/Torxed/spiderWeb.git) - Addon for slimHTTP which attaches an upgrader (handler) for websocket requests.
 * [slimWebSocket](https://github.com/Torxed/slimWebSocket.git) - JavaScript framework to wrap websockets to act as a normal network socket.
 * [python-olife](https://github.com/Torxed/python-olife.git) - library to talk to the identity manager.

 Running it
 ==========

 There are some pre-requisits before running this.
 The identity manager has some steps to claim a domain, once that's done logins can be done too.

 Then it's quite simple:

 ```bash
 $ cd OpenVPN_easyinstall
 $ sudo python easyinstall.py
 ```
