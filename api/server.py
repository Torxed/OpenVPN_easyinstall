import json
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
		'server' : {'network' : '!ip', 'netmask' : '!netmask'},
		'tls-auth' : {'file' : '!filename', 'direction' : [0, 1]},
		'status' : '!filename',
		'verb' : '!number'
	}

	if key in options:
		return options[key]
	else:
		return None

def expand_helper_directives(general_conf):
	expanded_config = {**general_conf}
	for key, val in list(general_conf.items()):
		if key == 'dev':
			if val == 'tap':
				expanded_config['topology'] = 'subnet'
			elif val == 'tun' and 'topology' not in expanded_config:
				expanded_config['topology'] = 'subnet'
		if key == 'tls-auth' and ' ' in val:
			val, expanded_config['key-direction'] = val.split(' ',1)
			expanded_config[key] = val
		if key == 'keepalive':
			# TODO: Use the values.
			if expanded_config['mode'] == 'server':
				if not 'push' in expanded_config: expanded_config['push'] = []

				expanded_config['ping'] = 10
				expanded_config['ping-restart'] = 120
				expanded_config['push'].append('ping 10')
				expanded_config['push'].append('ping-restart 60')
			else:
				expanded_config['ping'] = 10
				expanded_config['ping-restart'] = 120
			del(expanded_config[key])
		if key == 'server':
			subnet, netmask = val.split(' ',1) # TODO: Actually use this. But use it via ipaddress library for accurate subnet calulcations.
			expanded_config['mode'] = 'server'
			expanded_config['tls-server'] = True
			if not 'push' in expanded_config: expanded_config['push'] = []
			expanded_config['push'].append('topology subnet')

			if expanded_config['dev'] == 'tun' and expanded_config['topology'] in ('net30', 'p2p'):
				expanded_config['ifconfig'] = '10.8.0.1 10.8.0.2'
				if not 'nopool' in expanded_config or expanded_config['nopool'] is False:
					expanded_config['iconfig-pool'] = '10.8.0.4 10.8.0.251'
				expanded_config['route'] = '10.8.0.0 255.255.255.0'
				if 'client-to-client' in expanded_config:
					expanded_config['push'].append('route 10.8.0.0 255.255.255.0')
				elif expanded_config['topology'] == 'net30':
					expanded_config['push'].append('route 10.8.0.1')
			elif expanded_config['dev'] == 'tap' or (expanded_config['dev'] == 'tun' and expanded_config['topology'] == 'subnet'):
				expanded_config['ifconfig'] = '10.8.0.1 255.255.255.0'
				if not 'nopool' in expanded_config or expanded_config['nopool'] is False:
					expanded_config['ifconfig-pool'] = '10.8.0.2 10.8.0.253 255.255.255.0'
				if not 'route-gateway' in expanded_config:
					expanded_config['push'].append('route-gateway 10.8.0.2')
				else:
					expanded_config['push'].append('route-gateway 10.8.0.1')
			del(expanded_config[key])

	return expanded_config

def read_ovpn_conf(filename):
	conf = {}
	with open(filename, 'r') as fh:
		for line in fh:
			line = line.strip()
			if len(line) == 0: continue
			if line[0] in ('#', ';'): continue
			if '#' in line: line = line.split('#', 1)[0]
			line = line.strip()

			#print(line)
			if ' ' in line:
				key, val = line.split(' ', 1)
			else:
				key, val = line, True
			conf[key] = val

	return expand_helper_directives(conf)

def reload_config_cache():
	for filename in Path('./instances/').rglob('*.conf'):
		configs[filename.name[:-5]] = read_ovpn_conf(filename)

class parser():
	def process(self, path, client, data, headers, fileno, addr, *args, **kwargs):
		print('### Configuration ###\n', data, client)
		if 'get' in data:
			if data['get'] == 'server':
				# TODO: Old legacy code?!
				reload_config_cache()

				return {'configs' : configs}
			elif data['get'] == 'config_file':
				target = data['target']
				if not target in configs: return {'status' : 'failed', 'message' : 'This config does not exist.'}

				config_file_content = ''
				for key, val in configs[target].items():
					if type(val) in (list, tuple):
						for option in val:
							if type(option) is str:
								if key == 'push' and ' ' in option and not '"' in option: option = f'"{option}"'


							config_file_content += f'{key} {option}\r\n'
						continue
					elif key == 'ca':
						config_file_content += '<ca>\r\n'
						with open(f'./secrets/pki/ca/{val}') as ca_file:
							config_file_content += ca_file.read()
						config_file_content += '</ca>\r\n'
						continue
					elif key == 'cert':
						config_file_content += '<cert>\r\n'
						print('Embedding:', f'./secrets/pki/issued/{val}')
						with open(f'./secrets/pki/issued/{val}') as cert_File:
							config_file_content += cert_File.read()
						config_file_content += '</cert>\r\n'
						continue
					elif key == 'key':
						config_file_content += '<key>\r\n'
						with open(f'./secrets/pki/issued/{val}') as key_file:
							config_file_content += key_file.read()
						config_file_content += '</key>\r\n'
						continue
					elif type(val) == bool:
						config_file_content += f'{key}\r\n'
						continue
					
					config_file_content += f'{key} {val}\r\n'

				return {'status' : 'successful', 'target' : target, 'file_content' : config_file_content[:-2]} # Strip the last two line endings.

			reload_config_cache()
			return {'configs' : configs}
		elif 'update' in data and 'target' in data:
			if not data['target'] in configs: return {'status' : 'failed', 'message' : 'No such config in directory.'}

			for key, val in data['update'].items():
				configs[data['target']][key] = val

			#print(json.dumps(configs, indent=4))
			return {'status' : 'success'}
			return {'configs' : configs} ## <-- Will cuase a loop, because it will trigger a re-render of overview which will reload the cache. So before we do this, we need to move the in-mem configs to disk again before reload is called.
		else:
			reload_config_cache()

			return {'configs' : configs}