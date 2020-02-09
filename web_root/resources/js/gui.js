interfaces = {}

let elements = {}; // Used for popups
function popup(title_content, body_content, buttons_struct=null) {
	let popup_window = create_html_obj('div', {'classList' : 'popup', 'id' : 'popup_'+(Math.random() * 1001)}, document.getElementsByTagName("body")[0])
	let div = create_html_obj('div', {'classList' : 'popupbody'}, popup_window);

	let title = create_html_obj('div', {'classList' : 'title'}, div);
	if(typeof title_content === 'string')
		title.innerHTML = title_content;
	else
		title.appendChild(title_content);

	let body = create_html_obj('div', {'classList' : 'body'}, div);
	if(typeof body_content === 'string')
		body.innerHTML = body_content;
	else
		body.appendChild(body_content);
	
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

	popup_window.addEventListener('click', (event) => {
		if(event.target == popup_window) {
			popup_window.remove();
			document.querySelector('.container').style.filter = null;
		}
	})
	elements[title] = div;
	document.querySelector('.container').style.filter = 'blur(4px)';
	return popup_window;
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

function inline_table(headers, entries, stats, parent) {
	let o = create_html_obj('table', stats, parent);

	let header = create_html_obj('tr', {'classList' : 'tableheader'}, o);
	headers.forEach((title) => {
		let h = create_html_obj('td', {'classList' : 'tableheader'}, header);
		h.innerHTML = title;
	})

	let row_obj = create_html_obj('tr', {'classList' : 'tableheader'}, o);
	Object.keys(entries).forEach((column_name) => {
		column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
		switch(entries[column_name]) {
			case '!filename':
				input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'filename'}, column_obj);
				input_obj.value = entries[column_name];
				break;
			case '!number':
				input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'number', 'placeholder' : 'Enter a number'}, column_obj);
				input_obj.value = entries[column_name];
				break;
			case '!ip':
				input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'Enter a ip number'}, column_obj);
				input_obj.value = ''; //entries[column_name];
				break;
			case '!netmask':
				input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'Enter a netmask'}, column_obj);
				input_obj.value = ''; //entries[column_name];
				break;
			default:
				console.log('Unknown table column option:', entries[column_name])
				input_obj = create_html_obj('div', {'classList' : 'column'}, column_obj);
				input_obj.innerHTML = entries[column_name];
				break;
		}
	})
}

function cert_table(headers, entries, stats, parent, row_click=null, special_columns={}) {
	let o = create_html_obj('table', stats, parent);

	let header = create_html_obj('tr', {'classList' : 'tableheader'}, o);
	headers.forEach((title) => {
		let h = create_html_obj('td', {'classList' : 'tableheader'}, header);
		h.innerHTML = title;
	})

	Object.keys(entries).forEach((id) => {
		let row = create_html_obj('tr', {'classList' : 'row'}, o);
		let id_column = create_html_obj('td', {'classList' : 'column'}, row);
		let cert_column = create_html_obj('td', {'classList' : 'column'}, row);
		let key_column = create_html_obj('td', {'classList' : 'column'}, row);
		id_column.innerHTML = id;
		cert_column.innerHTML = entries[id]['cert'];
		key_column.innerHTML = entries[id]['key'];
	})

	return o;
}

function table(headers, entries, stats, parent, row_click=null, special_columns={}) {
	let o = create_html_obj('table', stats, parent);

	let header = create_html_obj('tr', {'classList' : 'tableheader'}, o);
	headers.forEach((title) => {
		let h = create_html_obj('td', {'classList' : 'tableheader'}, header);
		h.innerHTML = title;
	})
	let h = create_html_obj('td', {'classList' : 'tableheader'}, header);
	h.innerHTML = 'Description';

	Object.keys(entries).forEach((row) => {
		if(isArray(entries[row])) {
			entries[row].forEach((subrow) => {
				let row_obj = create_html_obj('tr', {'classList' : 'row'}, o);
				let first_column = create_html_obj('td', {'classList' : 'column'}, row_obj);
				first_column.innerHTML = row;
				
				column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
				let input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'filename'}, column_obj);
				input_obj.value = subrow;

				if (row_click) {
					let descr = create_html_obj('td', {'classList' : 'column centered'}, row_obj);
					descr.innerHTML = '<i class="far fa-question-circle"></i>';
					descr.addEventListener('click', () => {
						row_click(subrow);
					});
				} else {
					let descr = create_html_obj('td', {'classList' : 'column'}, row_obj);
					descr.innerHTML = '';
				}
			})
		} else {
			let row_obj = create_html_obj('tr', {'classList' : 'row'}, o);
			let first_column = create_html_obj('td', {'classList' : 'column'}, row_obj);
			first_column.innerHTML = row;
			
			column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
			if (typeof openvpn_options[row] !== 'undefined') {
				if (isArray(openvpn_options[row])) {
					let select = create_html_obj('select', {'classList' : 'input'}, column_obj);
					openvpn_options[row].forEach((option_text) => {
						let option = create_html_obj('option', {'value' : option_text, 'innerHTML' : option_text}, select)
						if(option_text == entries[row])
							option.selected = true;
					})
				} else {
					let input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'filename'}, column_obj);
					input_obj.value = entries[row];
				}
			} else {
				let input_obj = create_html_obj('input', {'classList' : 'input', 'type' : 'text', 'placeholder' : 'filename'}, column_obj);
				input_obj.value = entries[row];
			}

			if (row_click) {
				let descr = create_html_obj('td', {'classList' : 'column centered'}, row_obj);
				descr.innerHTML = '<i class="far fa-question-circle"></i>';
				descr.addEventListener('click', () => {
					row_click(row);
				});
			} else {
				let descr = create_html_obj('td', {'classList' : 'column'}, row_obj);
				descr.innerHTML = '';
			}
		}
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

					let popup_header = create_html_obj('div', {'classList' : 'header'}, popup_body);
					popup_header.innerHTML = '<i>(code has been sent to your e-mail)</i>';

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

class certificate_overview {
	constructor(container, probe=false) {
		this.container = container;
		this.container.innerHTML = '';

		this.build_header();
		this.html_obj = this.build_overview();

		if(probe)
			this.send_init_command();
	}

	build_header() {
		let contentHeader = create_html_obj('div', {'classList' : 'logoheader'}, this.container);

		let menu = create_html_obj('div', {'classList' : 'menu'}, contentHeader);
		let area = create_html_obj('div', {'classList' : 'body'}, this.container);

		// Buttons:
		let tmp = null;
		let btn_overview = create_html_obj('div', {'classList' : 'button active shadow', 'id' : 'btn_overview', 'innerHTML' : 'Overview'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_ca', 'innerHTML' : 'Certificate Authority'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button shadow', 'id' : 'btn_clients', 'innerHTML' : 'Issued Certificate'}, menu);
		tmp = create_html_obj('div', {'classList' : 'button right', 'id' : 'btn_logout', 'innerHTML' : 'Logout'}, menu);
		tmp.addEventListener('click', () => {
			localStorage.removeItem('obtain.life.token');
			window.location.href = '/';
		})

		btn_overview.addEventListener('click', function(event) {
			resource_handlers = {};
			clear_base();
			build_sidemenu(document.querySelector('.leftSide'))
			let view = new configuration_overview(document.querySelector('.rightSide'));
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

	parse_payload(json) {
		console.log(json);
		let certificates = create_html_obj('div', {'classList' : 'certificates'}, this.main_area)
		Object.keys(json['stores']).forEach((store) => {
			let certificate = div({'classList' : 'certificate'}, certificates);

			let ca_header = create_html_obj('div', {'classList' : 'serverHeader'}, certificate);
			let ca_title = create_html_obj('h3', {'classList' : 'title'}, ca_header);
			ca_title.innerHTML = store + ' store';
			let cert_add = create_html_obj('i', {'classList' : 'far fa-plus-square right blue cursor'}, ca_header)

			let table_obj = cert_table(
				['ID', 'Cert', 'Key'],
				json['stores'][store],
				{'classList' : 'table'}, certificate, (config_option_clicked) => {
					open_certificate(config_option_clicked);
			});
			
			cert_add.addEventListener('click', () => {
				if(store=='clients') {
					let popup_body = create_html_obj('div', {'classList' : 'card'});
					
					let popup_header = create_html_obj('div', {'classList' : 'header'}, popup_body);
					popup_header.innerHTML = 'Select a CA';

					let inputs = create_html_obj('div', {'classList' : 'inputs'}, popup_body);
					let select_ca = create_html_obj('select', {'classList' : 'input'}, inputs)
					create_html_obj('option', {'value' : 'ca.key', 'innerHTML' : 'ca.key'}, select_ca);

					inputs = create_html_obj('div', {'classList' : 'inputs'}, popup_body);
					popup_header = create_html_obj('div', {'classList' : 'header'}, popup_body);
					popup_header.innerHTML = 'Custom certificate options';
					let email = create_html_obj('input', {'classList' : 'input', 'placeholder' : 'email'}, inputs)

					popup_body.appendChild(inputs);

					let obj = popup("Generate new Client Certificate", popup_body, {
						"OK" : function(div) {
							socket.send({
								'_module' : 'certificates',
								'action' : 'generate',
								'ca' : select_ca.options[select_ca.selectedIndex].value,
								'cert_data' : {
									'emailAddress' : email.value,
									'cn' : email.value
								}
							})
							div.remove();
						}
					});

					email.focus();
				} else if(store=='ca') {
					let popup_body = create_html_obj('div', {'classList' : 'card'});
					
					let popup_header = create_html_obj('div', {'classList' : 'header'}, popup_body);
					popup_header.innerHTML = 'Create CA';

					let inputs = create_html_obj('div', {'classList' : 'inputs'}, popup_body);
					let common_name = create_html_obj('input', {'classList' : 'input', 'placeholder' : 'Common Name'}, inputs)
					let email = create_html_obj('input', {'classList' : 'input', 'placeholder' : 'email'}, inputs)

					popup_body.appendChild(inputs);

					let obj = popup("Generate new Client Certificate", popup_body, {
						"OK" : function(div) {
							let cn = common_name.value;
							if (cn.length == 0)
								cn = 'server';
							socket.send({
								'_module' : 'certificates',
								'action' : 'generate',
								'ca' : null, // Setting the CA to None, will tell the backend it's a CA we're about to generate
								'cert_data' : {
									'emailAddress' : email.value,
									'cn' : cn
								}
							})
							div.remove();
						}
					});

					email.focus();
					//obj.style.marginLeft = '-'+(obj.scrollWidth/2)+'px';
					//obj.style.marginTop = '-'+(obj.scrollHeight/2)+'px';
				}
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
		let contentHeader = create_html_obj('div', {'classList' : 'logoheader'}, this.container);

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
		tmp = create_html_obj('div', {'classList' : 'button right', 'id' : 'btn_logout', 'innerHTML' : 'Logout'}, menu);
		tmp.addEventListener('click', () => {
			localStorage.removeItem('obtain.life.token');
			window.location.href = '/';
		})

		btn_overview.addEventListener('click', function(event) {
			resource_handlers = {};
			clear_base();
			build_sidemenu(document.querySelector('.leftSide'))
			let view = new configuration_overview(document.querySelector('.rightSide'));
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
				let server = div({'classList' : 'server'}, this.main_area);

				let server_header = create_html_obj('div', {'classList' : 'serverHeader'}, server);
				let server_title = create_html_obj('h3', {'classList' : 'title'}, server_header);
				server_title.innerHTML = server_name
				let server_addOption = create_html_obj('i', {'classList' : 'far fa-plus-square right blue cursor'}, server_header)

				let table_obj = table(
					['Option', 'Value'],
					json_payload['configs'][server_name],
					{'classList' : 'table'}, server, (config_option_clicked) => {
						show_description(config_option_clicked);
				});
				
				server_addOption.addEventListener('click', () => {
					let tr = table_obj.insertRow(1);  // puts it at the start
					tr.classList = 'row';

					let key_td = create_html_obj('td', {'classList' : 'column'}, tr);
					let val_td = create_html_obj('td', {'classList' : 'column'}, tr);
					let descr_td = create_html_obj('td', {'classList' : 'column'}, tr);

					let key_input = create_html_obj('input', {'classList' : 'input'}, key_td);
					let val_input = create_html_obj('input', {'classList' : 'input'}, val_td);
				})
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