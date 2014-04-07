#!/usr/bin/python
# -*- coding: latin 1 -*-
import sys, zipfile
from os import popen as p
from os.path import join as joinpath
from os.path import exists, dirname, isfile, isdir
from os import _exit, makedirs, getcwd, chdir, walk
from time import sleep
from subprocess import *
from shutil import copy2 as cp
from shutil import rmtree
from getpass import getpass

__yourname__ = 'Anton Hvornum'
__yourmail__ = 'anton.hvo@gmail.com'
__yourdep__ = 'security'
__yourcnt__ = 'SE'
__yoursta__ = 'Småland'
__yourtown__ = 'Växjö'
__yourcom__ = 'Tri-Network HB'

__offline__ = False

clients = {}
server_destination = None
servercert_password = None
dhKeySize = None
reuseKeys = None

def zipdir(path, zip):
	for root, dirs, files in walk(path):
		for file in files:
			zip.write(joinpath(root, file))

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
			if pyVer == 3:
				self.handle.stdin.write(bytes(c, 'UTF-8'))
			else:
				self.handle.stdin.write(c)
			sys.stdout.flush()
			self.handle.stdin.flush()
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

def packConf(_map):
	data = ''

	# For style purposes only, it's nice to have it on the top
	if 'client' in _map: data += 'client\n'

	for key, val in _map.items():
		if key == 'client': continue
		data += key + ' ' + val + '\n'

	return data

def precheck(checks = []):
	checks.append('openvpn 2' in s('openvpn --version').lower())
	checks.append('openssl 1' in s('openssl version').lower())
	#s('updatedb') # refresh locate index, however this is not a standard cross-linux tool so we'll skip it.
	conf['clienttemplate'] = {'path' : s('find / | grep "\.conf" | egrep "(openvpn).*client\.conf"').split('\n')[0]}
	conf['servertemplate'] = {'path' : s('find / | grep "\.conf" | egrep "(openvpn).*server\.conf"').split('\n')[0]}
	conf['easy-rsa'] = dirname(s('find / | grep "easy-rsa/" | egrep ".*build-key-server"').split('\n')[0])

	# Sometimes the example configs is packaged in .gz files,
	# this will check the found file for .gz and unpack it.
	for config in ('clienttemplate', 'servertemplate'):
		if '.gz' in conf[config]['path']:
			s('gzip -d ' + conf[config]['path'])
			conf[config]['path'] = conf[config]['path'][:-3]

		with open(conf[config]['path'], 'r') as fh:
			if not 'data' in conf[config]:
				conf[config]['data'] = {}
			for line in fh:
				line = line.strip('\n')
				if len(line) == 0: continue
				if line[0] == '#': continue
				if not ' ' in line:
					conf[line] = ''
				else:
					key, val = line.split(' ', 1)
					conf[config]['data'][key] = val

	checks.append(len(conf['clienttemplate']) > 0)
	checks.append(len(conf['servertemplate']) > 0)
	checks.append(len(conf['easy-rsa']) > 0)

	return checks

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
			cliconf[line] = ''
	return cliconf

if len(clients) == 0:
	sys.stdout.write('No clients pre-configured!\nPlease enter as many names as you want below\nin order for me to generate some certificates.\n\nWhen you\'re done, write "done" or just press enter\n\n')
	sys.stdout.flush()
	while 1:
		name = input('Client name: ')
		if (name.lower() == 'done' or name == ''):
			if len(clients) <= 0:
				continue
			else:
				break
		if not name in clients:
			clients[name] = {}
		clients[name]['password'] = getpass('Enter client password (blank for none): ')
		os = input('Does this client run Linux (default: y): ')
		if os == 'you':
			clients[name]['platform'] = 'linux'
		else:
			clients[name]['platform'] = 'windows'
		sys.stdout.write('\n')
		sys.stdout.flush()

if servercert_password is None:
	sys.stdout.write('A (optional) password can be set on the server-cert,\nno pre-configured password was given so you\'re presented\nwith the option to set one now:\n')
	sys.stdout.flush()
	servercert_password = getpass('Enter the server-cert password (blank for none): ')
	sys.stdout.write('\n')
if dhKeySize is None:
	sys.stdout.write('The Diffie-Hellman key needs a defined size,\nOne of these sizees are acceptable:\n * 1024\n * 2048\n * 4096\n')
	sys.stdout.flush()
	dhKeySize = {'' : 2048, '1024' : 1024, '2048' : 2048, '4096' : 4096}[input('[DUMMY] DH keysize (default: 2048): ')]
	sys.stdout.write('\n')
if server_destination is None and not __offline__:
	sys.stdout.write('When running in __online__ mode, you need to define a SERVER-destination.\nConfiguration and certificates will be extracted to this location.\nEnter the destination in one of the following formats:\n')
	sys.stdout.write(' * ssh://user[:pass]@host:/target/path\n')
	sys.stdout.write(' * local://[user:pass]@/target/path\n\n')
	sys.stdout.flush()
	server_destination = input('Enter the destination: ')
	sys.stdout.write('\n')

pyVer = sys.version_info.major

conf = {}
for arg in sys.argv[1:]:
	if '=' in arg:
		arg, val = arg.split('=', 1)
		conf[arg] = val

requirements = precheck()
if False in requirements:
	sys.stdout.write('One or more required prequesits was not met:\n')
	if not requirements[0]:
		sys.stdout.write(' * OpenVPN 2.X\n')
	if not requirements[1]:
		sys.stdout.write(' * OpenSSL 0.X (0.9.X)\n')
	if requirements[2:4] is (False, False):
		sys.stdout.write(' * Server & Client templates somehere on the machine\n')
	if not requirements[4]:
		sys.stdout.write(' * Could not locate easy-rsa\n')
	sys.stdout.flush()
	_exit(1)


cliconf = getconf(conf['clienttemplate']['path'])
servconf = getconf(conf['servertemplate']['path'])
servconf['dev'] = 'tap'
servconf['tls-auth'] = 'ta.key 0'
servconf['cipher'] = 'AES-128-CBC'
cliconf['tls-auth'] = 'ta.key 1'
cliconf['cipher'] = 'AES-128-CBC'


easy_rsa_dir = conf['easy-rsa']

originalDir = getcwd()
chdir(easy_rsa_dir)
if isdir('./keys') and reuseKeys is None:
	sys.stdout.write('A existing set of keys was found and no parameter told me to use them,\nshould we re-use the keys?\n')
	sys.stdout.flush()
	choice = input('Reuse the keys (If not i\'ll delete them, default: "y"): ')
	if choice == 'n':
		rmtree('./keys')

cwd = getcwd()
try:
	rmtree(cwd + '/keyboundles')
except FileNotFoundError:
	pass # Not present, which is good because that's what we want right :)

buildca = interact('source ./vars && ./clean-all && ./build-ca')
#buildca = interact('./bca.sh') #BuildCA

buildca.send(__yourcnt__ + '\n')
buildca.send(__yoursta__ + '\n')
buildca.send(__yourtown__ + '\n')
buildca.send(__yourcom__ + '\n')
buildca.send(__yourdep__ + '\n')
buildca.send(__yourcom__ + '\n')
buildca.send(__yourname__ + '\n')
buildca.send(__yourmail__ + '\n')
#buildca.close()
while buildca.poll() is None:
	sleep(0.1)


buildserver = interact('source ./vars && ./build-key-server vpnserver')
#buildserver = interact('./bs.sh build-key-server vpnserver')

buildserver.send(__yourcnt__ + '\n')
buildserver.send(__yoursta__ + '\n')
buildserver.send(__yourtown__ + '\n')
buildserver.send(__yourcom__ + '\n')
buildserver.send(__yourdep__ + '\n')
buildserver.send('\n') # Defaults to the keyname
buildserver.send(__yourname__ + '\n')
buildserver.send(__yourmail__ + '\n')
buildserver.send(servercert_password + '\n')
buildserver.send('\n')
buildserver.send('y\n')
buildserver.send('y\n')
while buildserver.poll() is None:
	sleep(0.1)

ta = interact('openvpn --genkey --secret ta.key')
while ta.poll() is None:
	sleep(0.1)

server_addr = None
if not __offline__ and server_destination[:6] == 'ssh://':
	server_addr = server_destination[6:].split(':/')[0]
	if '@' in server_addr:
		server_addr = server_addr.split('@')[1]
else:
	# An attempt to get the external IP address of the server.
	import socket
	ips = [ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if (not ip.startswith("127.") and not ip.startswith('10.') and not ip.startswith('172.'))]
	if len(ips) == 1:
		server_addr = ips[0]
	else:
		sys.stdout.write('Select which of the following is the intended openvpn server address:\n')
		for i in range(1, len(ips)+1):
			sys.stdout.write(str(i) + ': ' + ips[i] + '\n')
		choice = '-1'
		while choice.isdigit() and (len(ips) < int(choice) > len(ips)):
			choice = input('Enter the number to which an ip is presented as your external IP: ')

		server_addr = ips[int(choice)]

for client in clients:
	buildclient = interact('source ./vars && ./build-key ' + client)
	buildclient.send(__yourcnt__ + '\n')
	buildclient.send(__yoursta__ + '\n')
	buildclient.send(__yourtown__ + '\n')
	buildclient.send(__yourcom__ + '\n')
	buildclient.send(__yourdep__ + '\n')
	buildclient.send('\n') # Defaults to the keyname
	buildclient.send(__yourname__ + '\n')
	buildclient.send(__yourmail__ + '\n')
	buildclient.send(clients[client]['password']+'\n')
	buildclient.send('\n')
	buildclient.send('y\n')
	buildclient.send('y\n')
	while buildclient.poll() is None:
		sleep(0.1)
	if not exists(getcwd() + '/keyboundles/client/' + client + '/'):
		makedirs(getcwd() + '/keyboundles/client/' + client + '/')
	cp(getcwd() + '/keys/ca.crt', cwd + '/keyboundles/client/'+client+'/')
	#cp(cwd + '/dh*', cwd + '/keyboundles/server/')
	cp(getcwd() + '/keys/' + client + '.crt', cwd + '/keyboundles/client/'+client+'/')
	cp(getcwd() + '/keys/' + client + '.key', cwd + '/keyboundles/client/'+client+'/')
	cp(getcwd() + '/ta.key', cwd + '/keyboundles/client/'+client+'/')

	cliconf['cert'] = client+'.crt'
	cliconf['key'] = client+'.key'
	cliconf['dev'] = 'tap'
	cliconf['remote'] = server_addr +' 1194'
	if clients[client]['platform'] == 'windows':
		cliconf['dev-node'] = '"Local Area Connection 2"'
	clientConf = packConf(cliconf)
	with open(cwd + '/keyboundles/client/'+client+'/client.ovpn', 'w') as fh:
		fh.write(clientConf)

dh = interact('source ./vars && ./build-dh')
while dh.poll() is None:
	sleep(0.1)

if not __offline__ and server_destination[:6] == 'ssh://':
	if not exists(cwd + '/keyboundles/server/'):
		makedirs(cwd + '/keyboundles/server/')
	
	cp(cwd + '/keys/ca.crt', cwd + '/keyboundles/server/')
	cp(cwd + '/keys/ca.key', cwd + '/keyboundles/server/')
	for size in range(1024,8192,1024):
		if isfile(cwd + '/keys/dh'+str(size)+'.pem'):
			servconf['dh'] = 'dh'+str(size)+'.pem'
			cp(cwd + '/keys/dh'+str(size)+'.pem', cwd + '/keyboundles/server/')
			break
	cp(cwd + '/keys/vpnserver.crt', cwd + '/keyboundles/server/')
	cp(cwd + '/keys/vpnserver.key', cwd + '/keyboundles/server/')
	cp(getcwd() + '/ta.key', cwd + '/keyboundles/server/')

	servconf['cert'] = 'vpnserver.crt'
	servconf['key'] = 'vpnserver.key'

	serverConf = packConf(servconf)
	with open(cwd + '/keyboundles/server/vpnserver.ovpn', 'w') as fh:
		fh.write(serverConf)

	chdir(originalDir)
	zipf = zipfile.ZipFile('server.zip', 'w')
	chdir(cwd + '/keyboundles/')
	zipdir('server/', zipf)
	zipf.close()
	chdir(cwd)
else:
	destdir = server_destination[6:].split('@',1)[1]
	print('Copying server certificates and config to:',destdir)
	cp(cwd + '/keys/ca.crt', destdir)
	cp(cwd + '/keys/ca.key', destdir)
	for size in range(1024,8192,1024):
		if isfile(cwd + '/keys/dh'+str(size)+'.pem'):
			servconf['dh'] = 'dh'+str(size)+'.pem'
			cp(cwd + '/keys/dh'+str(size)+'.pem', destdir)
			break
	cp(cwd + '/keys/vpnserver.crt', destdir)
	cp(cwd + '/keys/vpnserver.key', destdir)
	cp(getcwd() + '/ta.key', destdir)

	servconf['cert'] = 'vpnserver.crt'
	servconf['key'] = 'vpnserver.key'
	serverConf = packConf(servconf)
	with open(destdir+'/vpnserver.ovpn', 'w') as fh:
		fh.write(serverConf)

for client in clients:
	# In order to place the .zip in the actual ./ dir
	chdir(originalDir)
	zipf = zipfile.ZipFile(client+'.zip', 'w')
	# Then we move in the the working-dir of the easy-rsa's keyboundles
	chdir(cwd + '/keyboundles/client/')
	# Append the client folder to the zipfile
	zipdir(client+'/', zipf)
	zipf.close()

# Then we move into the easy-rsa folder and remove the boundles folder.
chdir(cwd)
rmtree(cwd + '/keyboundles')

sys.stdout.write('Done\n')
sys.stdout.flush()

# if windows:
# sysfunc('netsh int ip set int <OpenVPN or name of the network tap> metric=5')