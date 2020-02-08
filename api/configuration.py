
class parser():
	def process(self, path, client, data, headers, fileno, addr, *args, **kwargs):
		print('### Configuration ###\n', data, client)
		if 'get' in data:
			if data['get'] == 'overview':
				pass