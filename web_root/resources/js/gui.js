interfaces = {}

let elements = {}; // Used for popups
function popup(title_content, body_content, buttons_struct=null) {
	let div = document.createElement('div');
	let stylebar = document.createElement('div');
	stylebar.classList = 'stylebar';
	div.id = 'popup_'+(Math.random() * 1001);
	div.classList = 'popup';
	let title = document.createElement('div');
	title.classList = 'title';
	if(typeof title_content === 'string')
		title.innerHTML = title_content;
	else
		title.appendChild(title_content);
	let body = document.createElement('div');
	body.classList = 'body';
	if(typeof body_content === 'string')
		body.innerHTML = body_content;
	else
		body.appendChild(body_content);
	
	div.appendChild(stylebar);
	div.appendChild(title);
	div.appendChild(body);
	
	if(buttons_struct) {
		let buttons = document.createElement('div');
		buttons.classList = 'buttons';
		Object.keys(buttons_struct).forEach(function(label, index) {
			let button = document.createElement('button');
			button.innerHTML = label;
			button.classList = label;
			button.addEventListener('click', function(event) {
				buttons_struct[label](div);
			});
			buttons.appendChild(button);
		})
		div.appendChild(buttons);
	}
	elements[title] = div;
	document.getElementsByTagName("body")[0].appendChild(div);
	return div;
}

function append_stats_to_html_obj(obj, stats) {
	if (typeof stats === 'undefined')
		return;

	Object.keys(stats).forEach((key) => {
		if (key == 'id')
			obj.id = stats.id;
		else if (key == 'classList')
			obj.classList = stats.classList;
		else if (key == 'innerHTML')
			obj.innerHTML = stats['innerHTML'];
		else
			obj.setAttribute(key, stats[key])
	})

}

function create_html_obj(type, stats, parent) {
	let obj = document.createElement(type);
	append_stats_to_html_obj(obj, stats);

	if (parent)
		parent.appendChild(obj);

	return obj
}

function div(stats={}, parent=null) {
	return create_html_obj('div', stats, parent);
}

function h3(text, stats={}, parent=null) {
	let o = create_html_obj('h3', stats, parent);
	o.innerHTML = text;
	return o;
}

function isArray(obj) {
	if(obj instanceof Object && obj instanceof Array)
		return true;
	return false;
}

function isDict(obj) {
	if(obj instanceof Object) {
		if(obj instanceof Array)
			return false;
		return true
	}
	return false;
}

function table(headers, entries, stats, parent, row_click=null, special_columns={}) {
	let o = create_html_obj('table', stats, parent);

	let header = create_html_obj('tr', {'classList' : 'tableheader'}, o);
	headers.forEach((title) => {
		let h = create_html_obj('td', {'classList' : 'tableheader'}, header);
		h.innerHTML = title;
	})

	Object.keys(entries).forEach((row) => {
		let row_obj = create_html_obj('tr', {'classList' : 'row'}, o);
		let first_column = create_html_obj('td', {'classList' : 'column'}, row_obj);
		first_column.innerHTML = row;
		Object.keys(entries[row]).forEach((column) => {
			if (column == 'options')
				return;

			let column_obj = null;
			if (typeof special_columns[column] !== 'undefined') {
				let special_obj = special_columns[column](row, column, entries[row][column]);
				if(special_obj) {
					column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
					column_obj.appendChild(special_obj);
				}
			} else {
				if (typeof entries[row]['options'] !== 'undefined') {
					if (typeof entries[row]['options'] === 'string') {
						switch(entries[row]['options']) {
							case '!filename':
								column_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'filename'}, row_obj);
								column_obj.value = entries[row][column];
								break;
							case '!number':
								column_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'number', 'placeholder' : 'Enter a number'}, row_obj);
								column_obj.value = entries[row][column];
								break;
							default:
								console.log('Unknown table column option:', entries[row]['options'])
								column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
								column_obj.innerHTML = entries[row][column];
								break;
						}
					} else if (isArray(entries[row]['options'])) {
						let select = create_html_obj('select', {'classList' : 'input'}, row_obj)

						entries[row]['options'].forEach((value) => {
							let option = create_html_obj('option', {'classList' : 'option', 'value' : value, 'innerHTML' : value}, select);
							if(entries[row][column] == value)
								option.selected = true;
						})
					} else if (isDict(entries[row]['options'])) {
						console.log('dict')
						console.log(typeof entries[row]['options'], entries[row]['options'])
					}
				} else {
					column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
					column_obj.innerHTML = entries[row][column];
				}
			}
		})

		if (row_click)
			row_obj.addEventListener('click', () => {
				row_click(row);
			});
	})

	return o;
}

function slider(row, column, data) {
	let _switch = create_html_obj('div', {'classList' : 'onoffswitch'})
	let input = create_html_obj('input', {'classList' : 'onoffswitch-checkbox', 'id' : 'slider_'+row}, _switch);
	input.type = 'checkbox';
	input.name = 'onoffswitch';
	if(data === true || data == 'up')
		input.checked = true;
	else
		input.checked = false;

	let label = create_html_obj('label', {'classList' : 'onoffswitch-label'}, _switch)
	label.htmlFor = 'slider_'+row;

	let spaninner = create_html_obj('span', {'classList' : 'onoffswitch-inner'}, label);
	let spanswitch = create_html_obj('span', {'classList' : 'onoffswitch-switch'}, label);

	return _switch
}

class show_login {
	constructor(container) {
		this.container = container;
		this.container.innerHTML = '';

		this.build_header();
		this.html_obj = this.build_login();
	}

	build_header() {
		let area = create_html_obj('div', {'classList' : 'body'}, this.container);
	}

	build_login() {
		document.querySelector('.body').classList = 'body loginview';

		// Main content:
		let loginbox = create_html_obj('div', {'classList' : 'loginbox'}, document.querySelector('.body'));
		let loginFields = create_html_obj('div', {'classList' : 'fields'}, loginbox);
		let title = create_html_obj('h3', {'classList' : 'title', 'innerHTML' : 'Login'}, loginFields)
		let username = create_html_obj('input', {'classList' : 'input'}, loginFields);
		let password = create_html_obj('input', {'classList' : 'input'}, loginFields);
		let loginbutton = create_html_obj('button', {'classList' : 'button'}, loginFields);
		let footer = create_html_obj('div', {'classList' : 'footer'}, loginbox);
		let span = create_html_obj('span', {'classList' : 'footerdescription'}, footer);
		span.innerHTML = 'Authentication is provided by <a target="_blank" href="https://obtain.life">Obtain Life</a>.<br>Obtain Life is an open source Identity Manager.';

		username.placeholder = 'username'
		password.type = 'password';
		password.placeholder = 'password'
		loginbutton.innerHTML = 'Login using Obtain Life'
		loginbutton.style.margin = '5px';

		loginbutton.addEventListener('click', () => {
			olife_socket.subscribe('auth', (data) => {
				if(data['status'] == 'success' && typeof data['2FA'] !== 'undefined') {
					console.log('Authentication successful, showing 2FA popup.');
					//if(typeof data['challenge'] !== 'undefined' && typeof data['challenge_page'] !== 'undefined') {
					//	localStorage.setItem('obtain.life.claim_challenge', data['challenge']);
					//	window.location.href = data['challenge_page']+'?domain='+data['domain'];
					//}

					let popup_body = document.createElement('div');
					let two_factor_code = document.createElement('input');
					let inputs = document.createElement('div');
					
					inputs.classList = 'inputs';
					popup_body.classList = 'card';
					two_factor_code.type = 'text';
					two_factor_code.id = 'two_factor_code';
					two_factor_code.placeholder = 'Two factor code';
					two_factor_code.classList = 'input';

					let popup_header = document.createElement('div');
					popup_header.classList = 'header';
					popup_header.innerHTML = '<i>(code has been sent to your e-mail)</i>';

					popup_body.appendChild(popup_header);
					inputs.appendChild(two_factor_code);
					popup_body.appendChild(inputs);

					let obj = popup("Two factor authentication", popup_body, {
						"OK" : function(div) {
							let two_factor_payload = {
								"alg": life.mode,
								"domain": life.domain,
								"_module": "2FA",
								"2FA": data['2FA'],
								"code": parseInt(two_factor_code.value)
							};
							life.sign(two_factor_payload, function(signature) {
								two_factor_payload['sign'] = signature
								olife_socket.send(two_factor_payload);
							})
						}
					});

					two_factor_code.focus();
					obj.style.marginLeft = '-'+(obj.scrollWidth/2)+'px';
					obj.style.marginTop = '-'+(obj.scrollHeight/2)+'px';
					console.log();
				} else if (data['status'] == 'success' && typeof data['token'] !== 'undefined') {
					localStorage.setItem('obtain.life.token', data['token']);
					window.location.href = '/';
				} 
			})

			life.login(username.value, password.value, (payload) => {
				olife_socket.send(payload);
			});
		})
	}
}

class configuration_overview {
	constructor(container) {
		this.container = container;
		this.container.innerHTML = '';

		this.build_header();
		this.html_obj = this.build_overview();

		this.send_subscribes();
		this.send_init_command();
	}

	build_header() {
		let contentHeader = create_html_obj('div', {'classList' : 'header'}, this.container);

		let menu = create_html_obj('div', {'classList' : 'menu'}, contentHeader);
		let area = create_html_obj('div', {'classList' : 'body'}, this.container);

		// Buttons:
		let tmp = null;
		let btn_overview = create_html_obj('div', {'classList' : 'button active shadow', 'id' : 'btn_overview', 'innerHTML' : 'Overview'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_topology', 'innerHTML' : 'Topology'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_security', 'innerHTML' : 'Security'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_routing', 'innerHTML' : 'Routing'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_scrpits', 'innerHTML' : 'Scrpits'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_management', 'innerHTML' : 'Live Changes'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_osoptions', 'innerHTML' : 'OS Options'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_variables', 'innerHTML' : 'Variables'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadowEnd', 'id' : 'btn_advanced', 'innerHTML' : 'Advanced Options'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button right', 'id' : 'btn_editor', 'innerHTML' : 'Logout'}, menu);
		tmp.addEventListener('click', () => {
			localStorage.removeItem('obtain.life.token');
			window.location.href = '/';
		})

		btn_overview.addEventListener('click', function(event) {
			resource_handlers = {};
			let view = new configuration_overview(document.querySelector('.body'));
		})
	}

	build_overview() {
		this.main_area = create_html_obj('div', {'classList' : 'overview'}, this.container);

		/*
			To be honest, create a machine-area in this.main_area
			and use the machines() class to render the machines.
			No point in duplicating code.. but works for now since
			there's more issues to tackle before this is useable.
		*/
		return this.main_area.innerHTML;
	}

	send_subscribes() {
		socket.subscribe('configuration', (json_payload) => {
			console.log('Got configs:', json_payload)
			Object.keys(json_payload['configs']).forEach((server_name) => {
				this.server = div({'classList' : 'server'}, this.main_area);
				this.server_title = create_html_obj('h3', {'classList' : 'title'}, this.server);
				this.server_title.innerHTML = server_name

				let options = table(
					['Option', 'Value'],
					json_payload['configs'][server_name],
					{'classList' : 'table'}, this.server, (config_option_clicked) => {
						show_description(config_option_clicked);
				});
				/*
				Object.keys(json_payload['configs'][server_name]).forEach((config_option) => {
					let value = json_payload['configs'][server_name][config_option]['value'];
					let options = json_payload['configs'][server_name][config_option]['options'];

				})
				*/
			})
		})
	}

	send_init_command() {
		socket.send({
			'_module' : 'configuration',
			'get' : 'overview'
		})
	}
}