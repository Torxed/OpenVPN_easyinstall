_options = {
	'ca' : '!certificate_authorities',
	'cert' : '!certificates',
	'key' : '!private_keys',
	'cipher' : ['AES-256-GCM', 'AES-256-CBC'],
	'dev' : ['tun', 'tap'],
	'dh' : '!diffie_hellmans',
	'ecdh-curve' : ['secp521r1'],
	'explicit-exit-notify' : [0, 1],
	'ifconfig-pool-persist' : '!filename',
	'ping' : '!number',
	'ping-restart' : '!number',
	'persist-key' : [true, false],
	'persist-tun' : [true, false],
	'port' : '!number',
	'proto' : ['udp', 'tcp'],
	'server' : {'network' : '!ip', 'netmask' : '!netmask'},
	'tls-auth' : '!tls_auth', //{'file' : '!filename', 'direction' : [0, 1]},
	'key-direction' : [0, 1],
	'status' : '!filename',
	'verb' : '!number'
}
window.openvpn_options = _options;