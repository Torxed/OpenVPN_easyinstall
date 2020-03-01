import random, os
from OpenSSL.crypto import load_certificate, load_privatekey, PKey, FILETYPE_PEM, TYPE_RSA, X509, X509Req, dump_certificate, dump_privatekey
from pathlib import Path
class CA():
	def __init__(self, key, cert):
		if type(key) == str:
			with open(key, 'rb') as fh:
				self.key = load_privatekey(FILETYPE_PEM, fh.read())
				self.key_path = key
		else:
			self.key = key
			self.key_path = 'Unknown'
		if type(cert) == str:
			with open(cert, 'rb') as fh:
				self.cert = load_certificate(FILETYPE_PEM, fh.read())
				self.cert_path = cert
		else:
			self.cert = cert
			self.cert_path = 'Unknown'
		
		self.issued_certificats = {}

	def verify(self, key_obj):
		if self.cert.get_issuer().hash() == key_obj.cert.get_issuer().hash():
			return True
		return False

class key():
	def __init__(self, key, cert):
		with open(key, 'rb') as fh:
			self.key = load_privatekey(FILETYPE_PEM, fh.read())
			self.key_path = key
		with open(cert, 'rb') as fh:
			self.cert = load_certificate(FILETYPE_PEM, fh.read())
			self.cert_path = cert
		
		self.issued_certificats = {}

def generate_certificate(key, cert=None, **kwargs):
	# https://gist.github.com/kyledrake/d7457a46a03d7408da31
	# https://github.com/cea-hpc/pcocc/blob/master/lib/pcocc/Tbon.py
	# https://www.pyopenssl.org/en/stable/api/crypto.html
	a_day = 60*60*24
	if not 'country' in kwargs: kwargs['country'] = 'SE'
	if not 'sate' in kwargs: kwargs['state'] = 'Stockholm'
	if not 'city' in kwargs: kwargs['city'] = 'Stockholm'
	if not 'organization' in kwargs: kwargs['organization'] = 'Evil Scientist'
	if not 'unit' in kwargs: kwargs['unit'] = 'Security'
	if not 'cn' in kwargs: kwargs['cn'] = 'server'
	if not 'email' in kwargs: kwargs['email'] = 'evil@scientist.cloud'
	if not 'expires' in kwargs: kwargs['expires'] = a_day*365
	if not 'key_size' in kwargs: kwargs['key_size'] = 4096
	if not 'join' in kwargs: kwargs['join'] = True
	if not 'ca' in kwargs: kwargs['ca'] = None

	priv_key = PKey()
	priv_key.generate_key(TYPE_RSA, kwargs['key_size'])
	serialnumber=random.getrandbits(64)

	if not kwargs['ca']:
		# If no ca cert/key was given, assume that we're trying
		# to set up a CA cert and key pair.
		certificate = X509()
		certificate.get_subject().C = kwargs['country']
		certificate.get_subject().ST = kwargs['state']
		certificate.get_subject().L = kwargs['city']
		certificate.get_subject().O = kwargs['organization']
		certificate.get_subject().OU = kwargs['unit']
		certificate.get_subject().CN = kwargs['cn']
		certificate.set_serial_number(serialnumber)
		certificate.gmtime_adj_notBefore(0)
		certificate.gmtime_adj_notAfter(kwargs['expires'])
		certificate.set_issuer(certificate.get_subject())
		certificate.set_pubkey(priv_key)
		certificate.sign(priv_key, 'sha512')
	else:
		# If a CA cert and key was given, assume we're creating a client
		# certificate that will be signed by the CA.
		req = X509Req()
		req.get_subject().C = kwargs['country']
		req.get_subject().ST = kwargs['state']
		req.get_subject().L = kwargs['city']
		req.get_subject().O = kwargs['organization']
		req.get_subject().OU = kwargs['unit']
		req.get_subject().CN = kwargs['cn']
		req.get_subject().emailAddress = kwargs['email']
		req.set_pubkey(priv_key)
		req.sign(priv_key, 'md5')

		certificate = X509()
		certificate.set_serial_number(serialnumber)
		certificate.gmtime_adj_notBefore(0)
		certificate.gmtime_adj_notAfter(kwargs['expires'])
		certificate.set_issuer(kwargs['ca'].cert.get_subject())
		certificate.set_subject(req.get_subject())
		certificate.set_pubkey(req.get_pubkey())
		certificate.sign(kwargs['ca'].key, 'md5')

	cert_dump = dump_certificate(FILETYPE_PEM, certificate)
	key_dump = dump_privatekey(FILETYPE_PEM, priv_key)

	if not os.path.isdir(os.path.dirname(key)):
		os.makedirs(os.path.dirname(key))

	if kwargs['join']:
		with open(key, 'wb') as fh:
			fh.write(cert_dump)
			fh.write(key_dump)
	else:
		with open(key, 'wb') as fh:
			fh.write(key_dump)
		with open(cert, 'wb') as fh:
			fh.write(cert_dump)

	return priv_key, certificate

def load_CAs(root='./secrets/pki/ca'):
	ca_store = {}
	for key in Path('./secrets/pki/ca').rglob('*.key'):
		key_full_path = str(key.resolve().absolute())
		relative_path = key_full_path.replace(os.getcwd(), '.')

		ca_store[key.name[:-4]] = CA(relative_path, f'{relative_path[:-4]}.crt')
	return ca_store

def load_keys(ca_store):
	key_store = {}
	for key_file in Path('./secrets/pki/issued').rglob('*.key'):
		key_full_path = str(key_file.resolve().absolute())
		relative_path = key_full_path.replace(os.getcwd(), '.')

		key_obj = key(relative_path, f'{relative_path[:-4]}.crt')
		for ca in ca_store:
			if ca_store[ca].verify(key_obj):
				key_store[key_file.name] = key_obj
				break

	return key_store

class parser():
	def process(self, path, client, data, headers, fileno, addr, *args, **kwargs):
		print('### Certificates ###\n', data, client)

		ca_store = load_CAs()
		key_store = load_keys(ca_store)

		store = {
			'ca' : {},
			'certificate' : {},
			'key' : {},
			'dh' : {},
			'tls_auth' : {}
		}

		for ca in ca_store:
			store['ca'][ca_store[ca].cert.get_subject().CN] = {'key' : ca_store[ca].key_path, 'cert' : ca_store[ca].cert_path}

		for key in key_store:
			store['certificate'][key_store[key].cert.get_subject().CN] = {'key' : key_store[key].key_path, 'cert' : key_store[key].cert_path}
			store['key'][key_store[key].cert.get_subject().CN] = {'key' : key_store[key].key_path, 'cert' : key_store[key].cert_path}

		if 'action' in data and data['action'] == 'generate':
			if 'ca' in data and data['ca'] is not None:
				## Generate a client certificate and sign it.

				print(ca_store)
				key, cert = generate_certificate(f'./secrets/pki/issued/{data["cert_data"]["emailAddress"]}.key', f'./secrets/pki/issued/{data["cert_data"]["emailAddress"]}.crt', join=False, ca=ca_store[data["ca"]], **data["cert_data"])
				store['certificate'][cert.get_subject().CN] = {'key' : f'./secrets/pki/issued/{data["cert_data"]["emailAddress"]}.key', 'cert' : f'./secrets/pki/issued/{data["cert_data"]["emailAddress"]}.crt'}
				store['key'][cert.get_subject().CN] = {'key' : f'./secrets/pki/issued/{data["cert_data"]["emailAddress"]}.key', 'cert' : f'./secrets/pki/issued/{data["cert_data"]["emailAddress"]}.crt'}
			else:
				ca_key, ca_cert = generate_certificate(f'./secrets/pki/ca/{data["cert_data"]["cn"]}.key', f'./secrets/pki/ca/{data["cert_data"]["cn"]}.crt', join=False, cn=data['cert_data']['cn'])
				store['ca'][ca_cert.get_subject().CN] = {'key' : f'./secrets/pki/ca/{data["cert_data"]["cn"]}.key', 'cert' : f'./secrets/pki/ca/{data["cert_data"]["cn"]}.crt'}

		if 'get' in data:
			if data['get'] in store:
				return {data['get'] : store[data['get']]}

		return {'stores' : store}

if __name__ == '__main__':
	ca_key, ca_cert = generate_certificate('../secrets/pki/ca/ca.key', '../secrets/pki/ca/ca.crt', join=False)
	ca = CA(ca_key, ca_cert)

	key, cert = generate_certificate('../secrets/pki/issued/user.key', '../secrets/pki/issued/user.crt', join=False, ca=ca, cn='testcert')
	# openssl verify -CAfile ca.crt user.crt