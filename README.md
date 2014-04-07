OpenVPN_easyinstall
===================

Python2+ based OpenVPN 2.X configurator &amp; installer<br>
( *Requires Linux/Unix on the easy-install machine for now, will be converted later* )
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

The result is zip files in ./ from wherever the script was called for each client and a server.zip for the server.

---------------------


Intention with Easy-Install
============

 - Installs all binaries (havn't descided if this is a good idea yet)
 - Generates all certificates
 - Generates configure files
 - Places everything in the proper place (even remote destinations in v1.0)


TODOs
=====

 - Support configuration parameters instead of variables in the top of the code
 - Add the actual remote copy (including windows based destinations)
 - Add support to variable DH size, at the moment it only goes for the standard one (partially implemented)
 - Make the configuration generation more dynamic.
 - If possible, start OpenVPN server and at least 1 client and verify connection in the setup script.

Example
=======
As simple as pi:
``./setup.py`` or ``python setup.py``
and watch your ./ directory for the *.zip files.
