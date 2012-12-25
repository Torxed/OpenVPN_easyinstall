OpenVPN_easyinstall
===================

Python based OpenVPN 2.X installer &amp; configurator<br>
<br>
<br>
<br>
**There are two modles**
---------------------
 - the online installer:

![Visual representation](https://drive.google.com/uc?export=download&id=0B1eeO3A_DUEtaTJsbXFuNHpmNmc)

---------------------

- The offline installer
 
Does everything the online installer does except deploy and test the connection.
It simply builds and packages everything according to the specifications and stores it locally.
---------------------


Introduction
============

 - Installs all binaries
 - Generates all certificates
 - Generates configure files
 - Places everything in the proper place (even remote destinations)


TODOs
=====

 - Clean up the two bash-scripts and if possible replace with a Python Popen('bash|cmd') session
 - Make the client number optional (incl naming of certificates)
 - Add the actual remote copy (including windows based destinations)
 - Add support to variable DH size, at the moment it only goes for the standard one
 - output the config to .ovpn files, as of now it's just stored in memory.
 - take openvpn config input for client and server, as of now it just build config files according to my liking.
 - If possible, start OpenVPN server and at least 1 client and verify connection in the setup script.

Example
=======
As simple as pi:
``./setup.py``
and watch your ./keys/ directory.
