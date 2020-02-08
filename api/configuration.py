from pathlib import Path

configs = {}

def get_ovpn_options(key):
	options = {
		'ca' : '!filename',
		'cert' : '!filename',
		'key' : '!filename',
		'cipher' : ['AES-256-GCM', 'AES-256-CBC'],
		'dev' : ['tun', 'tap'],
		'dh' : '!filename',
		'ecdh-curve' : ['secp521r1'],
		'explicit-exit-notify' : [0, 1],
		'ifconfig-pool-persist' : '!filename',
		'keepalive' : {'interval' : 10, 'timeout' : 120},
		'persist-key' : [True, False],
		'persist-tun' : [True, False],
		'port' : '!number',
		'proto' : ['udp', 'tcp'],
		'server' : {'network' : '!ip', 'netmask' : '!ip'},
		'tls-auth' : {'file' : '!filename', 'direction' : [0, 1]},
		'status' : '!filename',
		'verb' : '!number'
	}

	if key in options:
		return options[key]
	else:
		return None

def read_ovpn_conf(filename):
	conf = {}
	with open(filename, 'r') as fh:
		for line in fh:
			line = line.strip()
			if len(line) == 0: continue
			if line[0] in ('#', ';'): continue
			if '#' in line: line = line.split('#', 1)[0]
			line = line.strip()

			print(line)
			if ' ' in line:
				key, val = line.split(' ', 1)
			else:
				key, val = line, True
			conf[key] = {'value' : val, 'options' : get_ovpn_options(key)}
	return conf

def reload_config_cache():
	for filename in Path('./instances/').rglob('*.conf'):
		configs[filename.name[:-5]] = read_ovpn_conf(filename)

class parser():
	def process(self, path, client, data, headers, fileno, addr, *args, **kwargs):
		print('### Configuration ###\n', data, client)
		if 'get' in data:
			if data['get'] == 'overview':
				reload_config_cache()

				return {'configs' : configs}