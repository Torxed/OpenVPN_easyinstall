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
	if (typeof stats.id !== 'undefined')
		obj.id = stats.id;
	if (typeof stats.classList !== 'undefined')
		obj.classList = stats.classList;
	if (typeof stats.innerHTML !== 'undefined')
		obj.innerHTML = stats['innerHTML'];
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
			if (typeof special_columns[column] !== 'undefined') {
				let special_obj = special_columns[column](row, column, entries[row][column]);
				if(special_obj) {
					let column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
					column_obj.appendChild(special_obj);
				}
			} else {
				let column_obj = create_html_obj('td', {'classList' : 'column'}, row_obj);
				column_obj.innerHTML = entries[row][column];
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

		})
	}

	send_init_command() {
		socket.send({
			'_module' : 'configuration',
			'get' : 'overview'
		})
	}
}