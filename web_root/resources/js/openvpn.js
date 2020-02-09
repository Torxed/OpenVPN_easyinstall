_options = {
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
	'persist-key' : [true, false],
	'persist-tun' : [true, false],
	'port' : '!number',
	'proto' : ['udp', 'tcp'],
	'server' : {'network' : '!ip', 'netmask' : '!netmask'},
	'tls-auth' : {'file' : '!filename', 'direction' : [0, 1]},
	'status' : '!filename',
	'verb' : '!number'
}
window.openvpn_options = _options;