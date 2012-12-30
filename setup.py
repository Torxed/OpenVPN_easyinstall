#!/usr/bin/python
# -*- coding: latin 1 -*-
import sys
from os import popen as p
from os.path import exists
from os import _exit, makedirs, getcwd
from time import sleep
from subprocess import *
from shutil import copy2 as cp

__yourname__ = 'Anton Hvornum'
__yourmail__ = 'anton.hvo@gmail.com'
__yourdep__ = 'security'
__yourcnt__ = 'SE'
__yoursta__ = 'Småland'
__yourtown__ = 'Växjö'
__yourcom__ = 'Tri-Network HB'



conf = {}
for arg in sys.argv[1:]:
	if '=' in arg:
		arg, val = arg.split('=', 1)
		conf[arg] = val
def s(c):
	r = ''
	for l in p(c): r += l
	return r

class interact():
	def __init__(self, c):
		self.handle = Popen(c, stdin=PIPE, shell=True, stdout=PIPE)
		sleep(1)
		self.handle.poll()
	def send(self, what):
		for c in what:
			sys.stdout.write(c)
			self.handle.stdin.write(c)
			sys.stdout.flush()
			sleep(0.05)
	def poll(self):
		return self.handle.poll()
	def close(self):
		try:
			self.handle.close()
		except:
			pass

def refstr(s):
	return s.strip(" \t:,\r\n\"'")

def precheck(checks = []):
	checks.append('openvpn 2' in s('openvpn --version').lower())
	checks.append('openssl 0' in s('openssl version').lower())
	s('updatedb') # refresh locate index
	conf['clienttemplate'] = s('find / | grep "\.conf" | egrep "(openvpn).*client\.conf"').split('\n')[0]
	conf['servertemplate'] = s('find / | grep "\.conf" | egrep "(openvpn).*server\.conf"').split('\n')[0]

	# Sometimes the example configs is packaged in .gz files,
	# this will check the found file for .gz and unpack it.
	for config in ('clienttemplate', 'servertemplate'):
		if '.gz' in conf[config]:
			s('gzip -d ' + conf[config])
			conf[config] = conf[config][:-3]

	checks.append(len(conf['clienttemplate']) > 0)
	checks.append(len(conf['servertemplate']) > 0)
	return False not in checks

def getconf(c):
	fh = open(c, 'r')
	fd = fh.read().replace('\r\n', '\n').replace('\r', '\n')
	fh.close()
	cliconf = {}
	for line in fd.split('\n'):
		if len(line) <= 0: continue
		if line[0] in ('#', ';'): continue # This is a comment line

		if ' ' in line:
			k, v = line.split(' ', 1)
			cliconf[k] = v
		else:
			cliconf[line] = True
	return cliconf

if not precheck():
	sys.stdout.write('One or more required prequesits was not met:')
	sys.stdout.write(' * OpenVPN 2.X')
	sys.stdout.write(' * OpenSSL 0.X (0.9.X)')
	sys.stdout.write(' * Server & Client templates somehere on the machine')
	sys.stdout.flush()
	_exit(1)


cliconf = getconf(conf['clienttemplate'])
servconf = getconf(conf['servertemplate'])

buildca = interact('./bca.sh') #BuildCA


buildca.send(__yourcnt__ + '\n')
buildca.send(__yoursta__ + '\n')
buildca.send(__yourtown__ + '\n')
buildca.send(__yourcom__ + '\n')
buildca.send(__yourdep__ + '\n')
buildca.send(__yourcom__ + '\n')
buildca.send(__yourname__ + '\n')
buildca.send(__yourmail__ + '\n')
#buildca.close()
while buildca.poll() != 0:
	sleep(0.1)

buildserver = interact('./bs.sh build-key-server vpnserver')
buildserver.send(__yourcnt__ + '\n')
buildserver.send(__yoursta__ + '\n')
buildserver.send(__yourtown__ + '\n')
buildserver.send(__yourcom__ + '\n')
buildserver.send(__yourdep__ + '\n')
buildserver.send('\n') # Defaults to the keyname
buildserver.send(__yourname__ + '\n')
buildserver.send(__yourmail__ + '\n')
buildserver.send('superpassword\n')
buildserver.send('\n')
buildserver.send('y\n')
buildserver.send('y\n')
while buildserver.poll() != 0:
	sleep(0.1)

buildclient = interact('./bs.sh build-key logserver')
buildclient.send(__yourcnt__ + '\n')
buildclient.send(__yoursta__ + '\n')
buildclient.send(__yourtown__ + '\n')
buildclient.send(__yourcom__ + '\n')
buildclient.send(__yourdep__ + '\n')
buildclient.send('\n') # Defaults to the keyname
buildclient.send(__yourname__ + '\n')
buildclient.send(__yourmail__ + '\n')
buildclient.send('superpassword\n')
buildclient.send('\n')
buildclient.send('y\n')
buildclient.send('y\n')
while buildclient.poll() != 0:
	sleep(0.1)

buildclient = interact('./bs.sh build-key logclient')
buildclient.send(__yourcnt__ + '\n')
buildclient.send(__yoursta__ + '\n')
buildclient.send(__yourtown__ + '\n')
buildclient.send(__yourcom__ + '\n')
buildclient.send(__yourdep__ + '\n')
buildclient.send('\n') # Defaults to the keyname
buildclient.send(__yourname__ + '\n')
buildclient.send(__yourmail__ + '\n')
buildclient.send('superpassword\n')
buildclient.send('\n')
buildclient.send('y\n')
buildclient.send('y\n')
while buildclient.poll() != 0:
	sleep(0.1)

dh = interact('./bs.sh build-dh')
while dh.poll() != 0:
	sleep(0.1)


cwd = getcwd()
keydir="/usr/share/doc/openvpn/examples/easy-rsa/2.0/keys"
if not exists(cwd + '/keys/server/'):
	makedirs(cwd + '/keys/server/')
if not exists(cwd + '/keys/client/logserver/'):
	makedirs(cwd + '/keys/client/logserver/')
if not exists(cwd + '/keys/client/logclient/'):
	makedirs(cwd + '/keys/client/logclient/')

cp(keydir + '/ca.crt', cwd + '/keys/server/')
cp(keydir + '/ca.key', cwd + '/keys/server/')
cp(keydir + '/dh1024.pem', cwd + '/keys/server/')
cp(keydir + '/vpnserver.crt', cwd + '/keys/server/')
cp(keydir + '/vpnserver.key', cwd + '/keys/server/')

cp(keydir + '/ca.crt', cwd + '/keys/server/')
#cp(keydir + '/dh*', cwd + '/keys/server/')
cp(keydir + '/logserver.crt', cwd + '/keys/client/logserver/')
cp(keydir + '/logserver.key', cwd + '/keys/client/logserver/')

cp(keydir + '/ca.crt', cwd + '/keys/server/')
#cp(keydir + '/dh*', cwd + '/keys/server/')
cp(keydir + '/logclient.crt', cwd + '/keys/client/logclient/')
cp(keydir + '/logclient.key', cwd + '/keys/client/logclient/')

sys.stdout.write(servconf)
sys.stdout.write(cliconf)
sys.stdout.flush()

# if windows:
# sysfunc('netsh int ip set int <OpenVPN or name of the network tap> metric=5')