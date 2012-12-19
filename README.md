OpenVPN_easyinstall
===================

Python based OpenVPN 2.X installer &amp; configurator


Introduction
============

 - Installs all binaries
 - Generates all certificates
 - Generates configure files
 - Places everything in the proper place (even remote destinations)


TODOs
=====

 - Make the client number optional (incl naming of certificates)
 - Add the actual remote copy (including windows based destinations)
 - Add support to variable DH size, at the moment it only goes for the standard one
 - output the config to .ovpn files, as of now it's just stored in memory.

Example
=======
As simple as pi:
``./setup.py``
and watch your ./keys/ directory.
