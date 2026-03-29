'use strict';
'require view';
'require rpc';
'require ui';

const STYLE_ID = 'cr881x-wan-mode-style';

const callInfo = rpc.declare({
	object: 'luci.cr881x_wan_mode',
	method: 'get_info',
	expect: {}
});

const callStatus = rpc.declare({
	object: 'luci.cr881x_wan_mode',
	method: 'status',
	expect: {}
});

const callApply = rpc.declare({
	object: 'luci.cr881x_wan_mode',
	method: 'apply',
	params: [ 'mode', 'port1', 'port2', 'auto_mac', 'mac1', 'mac2' ],
	expect: {}
});

function mac_is_valid(value) {
	if (!value)
		return true;

	return /^[0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5}$/.test(value);
}

function ensure_style() {
	if (document.getElementById(STYLE_ID))
		return;

	document.head.appendChild(E('style', { id: STYLE_ID }, [ `
		.cwm-page {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.cwm-panel {
			border: 1px solid var(--border-color-medium, #dfe3e8);
			border-radius: 12px;
			background: var(--panel-bg, #fff);
			padding: 14px;
			box-shadow: 0 1px 1px rgba(0, 0, 0, .03);
		}

		.cwm-hero {
			background: linear-gradient(140deg, #f9faf5 0%, #ffffff 55%, #f2f8f4 100%);
		}

		.cwm-head {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 10px;
		}

		.cwm-title {
			margin: 0;
			font-size: 20px;
			line-height: 1.2;
		}

		.cwm-subtitle {
			margin-top: 6px;
			color: var(--text-color-medium, #5f6c7b);
			line-height: 1.45;
		}

		.cwm-main {
			display: grid;
			grid-template-columns: 2fr 1fr;
			gap: 12px;
		}

		.cwm-metrics {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
			gap: 10px;
		}

		.cwm-metric {
			border: 1px solid var(--border-color-medium, #dfe3e8);
			border-radius: 10px;
			background: linear-gradient(180deg, #ffffff, #fbfcfd);
			padding: 10px;
			min-height: 86px;
		}

		.cwm-metric-k {
			font-size: 11px;
			text-transform: uppercase;
			letter-spacing: .05em;
			color: var(--text-color-medium, #5f6c7b);
		}

		.cwm-metric-v {
			margin-top: 8px;
			font-size: 20px;
			font-weight: 700;
			line-height: 1.1;
			word-break: break-word;
		}

		.cwm-metric-h {
			margin-top: 6px;
			font-size: 12px;
			color: var(--text-color-medium, #5f6c7b);
		}

		.cwm-mode-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
			gap: 10px;
		}

		.cwm-mode {
			display: block;
			border: 1px solid var(--border-color-medium, #dfe3e8);
			border-radius: 10px;
			padding: 10px;
			background: linear-gradient(180deg, #ffffff, #fbfcfd);
			cursor: pointer;
		}

		.cwm-mode input {
			display: none;
		}

		.cwm-mode.active {
			border-color: #72b882;
			box-shadow: 0 0 0 1px #72b882 inset;
			background: linear-gradient(180deg, #f7fff8, #f3fbf5);
		}

		.cwm-mode-title {
			font-size: 15px;
			font-weight: 700;
		}

		.cwm-mode-desc {
			margin-top: 4px;
			font-size: 12px;
			color: var(--text-color-medium, #5f6c7b);
			line-height: 1.4;
		}

		.cwm-field-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
			margin-top: 10px;
		}

		.cwm-field label {
			display: block;
			font-size: 12px;
			margin-bottom: 4px;
			color: var(--text-color-medium, #5f6c7b);
		}

		.cwm-field-full {
			grid-column: 1 / -1;
		}

		.cwm-preview {
			margin-top: 10px;
			padding: 10px;
			border-radius: 10px;
			border: 1px dashed var(--border-color-medium, #dfe3e8);
			background: #fbfcfd;
			display: grid;
			grid-template-columns: 1fr;
			gap: 6px;
		}

		.cwm-chip {
			display: inline-block;
			padding: 2px 9px;
			border-radius: 999px;
			font-size: 12px;
			font-weight: 600;
			border: 1px solid #cfe3d3;
			background: #ecf8ee;
			color: #1f6b37;
		}

		.cwm-chip.warn {
			border-color: #efc5bf;
			background: #fdecea;
			color: #962d1f;
		}

		.cwm-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
		}

		.cwm-k {
			font-size: 12px;
			color: var(--text-color-medium, #5f6c7b);
		}

		.cwm-v {
			font-weight: 600;
		}

		.cwm-actions {
			display: flex;
			justify-content: flex-end;
			gap: 8px;
			margin-top: 12px;
		}

		.cwm-side {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.cwm-help {
			font-size: 12px;
			line-height: 1.45;
			color: var(--text-color-medium, #5f6c7b);
		}

		.cwm-raw textarea {
			min-height: 160px;
		}

		@media (max-width: 1100px) {
			.cwm-main {
				grid-template-columns: 1fr;
			}
		}

		@media (max-width: 640px) {
			.cwm-head {
				flex-direction: column;
				align-items: stretch;
			}

			.cwm-field-grid {
				grid-template-columns: 1fr;
			}
		}
	` ]));
}

function ui_port_label(port) {
	return (port === 'wan') ? 'lan4' : port;
}

function ui_port_list(list) {
	if (!list)
		return '<unset>';

	return String(list).split(/\s+/).filter(Boolean).map(ui_port_label).join(' ');
}

function ui_wan_binding(port, role) {
	if (!port || port === '<unset>' || port === '<none>')
		return '<unset>';

	if (port === 'wan')
		return role + ' (lan4)';

	return ui_port_label(port) + ' (' + role + ')';
}

function mode_title(mode) {
	if (mode === 'all-lan')
		return _('All Ports As LAN');
	if (mode === 'single-wan')
		return _('Single WAN');
	if (mode === 'dual-wan')
		return _('Dual WAN');
	return mode || '<unknown>';
}

function mode_desc(mode) {
	if (mode === 'all-lan')
		return _('Every physical port is bridged into br-lan. WAN interfaces are removed.');
	if (mode === 'single-wan')
		return _('One selected port is WAN. Remaining ports stay in br-lan.');
	if (mode === 'dual-wan')
		return _('Two selected ports become WAN and WAN2. Remaining ports stay in br-lan.');
	return _('Unknown mode state from runtime configuration.');
}

function normalize_mode(st, modes) {
	if (st && st.mode && modes.indexOf(st.mode) >= 0)
		return st.mode;

	if (st && st.wan && st.wan !== '<unset>' && st.wan2 && st.wan2 !== '<unset>')
		return 'dual-wan';
	if (st && st.wan && st.wan !== '<unset>')
		return 'single-wan';

	return 'all-lan';
}

function list_minus(ports, skip1, skip2) {
	let out = [];

	for (let i = 0; i < ports.length; i++) {
		const p = ports[i];
		if (p === skip1 || p === skip2)
			continue;
		out.push(p);
	}

	return out;
}

function metric_card(title, hint) {
	const valueNode = E('div', { class: 'cwm-metric-v' }, [ '-' ]);
	const hintNode = E('div', { class: 'cwm-metric-h' }, [ hint || '' ]);

	return {
		node: E('div', { class: 'cwm-metric' }, [
			E('div', { class: 'cwm-metric-k' }, [ title ]),
			valueNode,
			hintNode
		]),
		set: function(value, nextHint) {
			valueNode.textContent = (value == null || value === '') ? '-' : String(value);
			if (nextHint != null)
				hintNode.textContent = String(nextHint);
		}
	};
}

function update_mode_cards(modeCards, mode) {
	Object.keys(modeCards).forEach(function(key) {
		modeCards[key].classList.toggle('active', key === mode);
	});
}

function set_selected(select, value) {
	if (!value || value === '<unset>' || value === '<none>')
		return;

	for (let i = 0; i < select.options.length; i++) {
		if (select.options[i].value === value) {
			select.selectedIndex = i;
			return;
		}
	}
}

function populate_port_options(select, ports) {
	select.innerHTML = '';
	for (let i = 0; i < ports.length; i++)
		select.appendChild(E('option', { value: ports[i] }, [ ui_port_label(ports[i]) ]));
}

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callInfo(), {}),
			L.resolveDefault(callStatus(), {})
		]);
	},

	render: function(data) {
		ensure_style();

		const info = data[0] || {};
		let currentStatus = data[1] || {};
		const ports = info.valid_ports || [ 'lan1', 'lan2', 'lan3', 'wan' ];
		const modes = info.valid_modes || [ 'all-lan', 'single-wan', 'dual-wan' ];

		let selectedMode = normalize_mode(currentStatus, modes);

		const refreshBtn = E('button', {
			type: 'button',
			class: 'cbi-button cbi-button-neutral'
		}, [ _('Refresh') ]);

		const applyBtn = E('button', {
			type: 'button',
			class: 'cbi-button cbi-button-apply'
		}, [ _('Apply') ]);

		const wan1Sel = E('select', { class: 'cbi-input-select', style: 'width:100%;' });
		const wan2Sel = E('select', { class: 'cbi-input-select', style: 'width:100%;' });
		populate_port_options(wan1Sel, ports);
		populate_port_options(wan2Sel, ports);

		set_selected(wan1Sel, currentStatus.wan);
		set_selected(wan2Sel, currentStatus.wan2);

		const modeCardsWrap = E('div', { class: 'cwm-mode-grid' });
		const modeCards = {};
		for (let i = 0; i < modes.length; i++) {
			const mode = modes[i];
			const input = E('input', { type: 'radio', name: 'cwm-mode', value: mode });
			const card = E('label', { class: 'cwm-mode' }, [
				input,
				E('div', { class: 'cwm-mode-title' }, [ mode_title(mode) ]),
				E('div', { class: 'cwm-mode-desc' }, [ mode_desc(mode) ])
			]);

			input.checked = (mode === selectedMode);
			card.addEventListener('click', function() {
				selectedMode = mode;
				sync_ui();
			});

			modeCards[mode] = card;
			modeCardsWrap.appendChild(card);
		}

		const wan1Row = E('div', { class: 'cwm-field' }, [
			E('label', {}, [ _('WAN1 Port') ]),
			wan1Sel
		]);
		const wan2Row = E('div', { class: 'cwm-field' }, [
			E('label', {}, [ _('WAN2 Port') ]),
			wan2Sel
		]);
		const autoMacCheckbox = E('input', { type: 'checkbox' });
		const autoMacRow = E('div', { class: 'cwm-field cwm-field-full' }, [
			E('label', {}, [ _('Auto-generate WAN MACs') ]),
			E('div', { class: 'cwm-help' }, [
				autoMacCheckbox,
				E('span', { style: 'margin-left:8px;' }, [
					_('Assign unique random MACs to WAN1 and WAN2 when applying dual WAN.')
				])
			])
		]);
		const wan1MacInput = E('input', {
			type: 'text',
			class: 'cbi-input-text',
			style: 'width:100%;',
			placeholder: '02:11:22:33:44:55'
		});
		const wan2MacInput = E('input', {
			type: 'text',
			class: 'cbi-input-text',
			style: 'width:100%;',
			placeholder: '02:11:22:33:44:66'
		});
		const wan1MacRow = E('div', { class: 'cwm-field' }, [
			E('label', {}, [ _('WAN1 MAC (optional)') ]),
			wan1MacInput,
			E('div', { class: 'cwm-help', style: 'margin-top:4px;' }, [
				_('Leave empty to keep current.')
			])
		]);
		const wan2MacRow = E('div', { class: 'cwm-field' }, [
			E('label', {}, [ _('WAN2 MAC (optional)') ]),
			wan2MacInput,
			E('div', { class: 'cwm-help', style: 'margin-top:4px;' }, [
				_('Leave empty to keep current.')
			])
		]);

		const validationNode = E('span', { class: 'cwm-chip', style: 'display:none;' });

		const previewMode = E('span', { class: 'cwm-v' }, [ '-' ]);
		const previewWan1 = E('span', { class: 'cwm-v' }, [ '-' ]);
		const previewWan2 = E('span', { class: 'cwm-v' }, [ '-' ]);
		const previewLan = E('span', { class: 'cwm-v' }, [ '-' ]);

		const boardMetric = metric_card(_('Board'), _('Detected target board'));
		const modeMetric = metric_card(_('Current mode'), _('Runtime mode from helper status'));
		const wanMetric = metric_card(_('WAN1 binding'), _('network.wan.device'));
		const wan2Metric = metric_card(_('WAN2 binding'), _('network.wan2.device'));
		const lanMetric = metric_card(_('br-lan ports'), _('Current bridge member ports'));

		const rawBox = E('textarea', {
			class: 'cbi-input-textarea',
			readonly: true,
			rows: 8,
			style: 'width:100%;font-family:monospace;'
		});

		function update_metrics(st) {
			boardMetric.set(st.board || '<unknown>');
			modeMetric.set(mode_title(st.mode || '<unknown>'), st.mode || '<unknown>');
			wanMetric.set(ui_wan_binding(st.wan, 'wan1'));
			wan2Metric.set(ui_wan_binding(st.wan2, 'wan2'));
			lanMetric.set(ui_port_list(st.br_lan_ports));

			rawBox.value = [
				'board: ' + (st.board || '<unknown>'),
				'mode: ' + (st.mode || '<unknown>'),
				'br-lan ports: ' + (st.br_lan_ports || '<unset>'),
				'wan: ' + (st.wan || '<unset>'),
				'wan2: ' + (st.wan2 || '<unset>'),
				(st.output ? ('\nhelper output:\n' + st.output) : '')
			].join('\n');
		}

		function validate_selection() {
			const p1 = wan1Sel.value;
			const p2 = wan2Sel.value;

			validationNode.style.display = 'none';
			validationNode.classList.remove('warn');

			if (selectedMode === 'dual-wan' && p1 === p2) {
				validationNode.textContent = _('WAN1 and WAN2 must be different ports');
				validationNode.classList.add('warn');
				validationNode.style.display = '';
				return false;
			}

			return true;
		}

		function update_preview() {
			const p1 = wan1Sel.value;
			const p2 = wan2Sel.value;
			let lanPorts = [];
			let wan1 = '<unset>';
			let wan2 = '<unset>';

			if (selectedMode === 'all-lan') {
				lanPorts = ports.slice();
			}
			else if (selectedMode === 'single-wan') {
				wan1 = p1;
				lanPorts = list_minus(ports, p1, '');
			}
			else {
				wan1 = p1;
				wan2 = p2;
				lanPorts = list_minus(ports, p1, p2);
			}

			previewMode.textContent = mode_title(selectedMode);
			previewWan1.textContent = ui_wan_binding(wan1, 'wan1');
			previewWan2.textContent = (selectedMode === 'dual-wan') ? ui_wan_binding(wan2, 'wan2') : '<disabled>';
			previewLan.textContent = lanPorts.map(ui_port_label).join(' ') || '<none>';
		}

		function sync_ui() {
			const showManualMac = (selectedMode === 'dual-wan' && !autoMacCheckbox.checked);
			wan1Row.style.display = (selectedMode === 'all-lan') ? 'none' : '';
			wan2Row.style.display = (selectedMode === 'dual-wan') ? '' : 'none';
			autoMacRow.style.display = (selectedMode === 'dual-wan') ? '' : 'none';
			wan1MacRow.style.display = showManualMac ? '' : 'none';
			wan2MacRow.style.display = showManualMac ? '' : 'none';
			update_mode_cards(modeCards, selectedMode);
			update_preview();
			validate_selection();
		}

		function refresh_status() {
			refreshBtn.disabled = true;
			return L.resolveDefault(callStatus(), {}).then(function(next) {
				currentStatus = next || {};
				selectedMode = normalize_mode(currentStatus, modes);
				set_selected(wan1Sel, currentStatus.wan);
				set_selected(wan2Sel, currentStatus.wan2);
				sync_ui();
				update_metrics(currentStatus);
			}).finally(function() {
				refreshBtn.disabled = false;
			});
		}

		wan1Sel.addEventListener('change', function() {
			validate_selection();
			update_preview();
		});
		wan2Sel.addEventListener('change', function() {
			validate_selection();
			update_preview();
		});
		autoMacCheckbox.addEventListener('change', function() {
			sync_ui();
		});

		refreshBtn.addEventListener('click', ui.createHandlerFn(this, function() {
			return refresh_status();
		}));

		applyBtn.addEventListener('click', ui.createHandlerFn(this, function() {
			if (!validate_selection()) {
				ui.addNotification(null, E('p', {}, [ _('WAN1 and WAN2 must use different ports') ]), 'error');
				return;
			}

			const p1 = wan1Sel.value;
			const p2 = wan2Sel.value;
			const autoMac = autoMacCheckbox.checked ? '1' : '';
			const mac1 = wan1MacInput.value.trim();
			const mac2 = wan2MacInput.value.trim();

			if (!autoMac && selectedMode === 'dual-wan') {
				if (!mac_is_valid(mac1)) {
					ui.addNotification(null, E('p', {}, [ _('Invalid WAN1 MAC address') ]), 'error');
					return;
				}
				if (!mac_is_valid(mac2)) {
					ui.addNotification(null, E('p', {}, [ _('Invalid WAN2 MAC address') ]), 'error');
					return;
				}
			}

			applyBtn.disabled = true;
			return callApply(selectedMode, p1, p2, autoMac, mac1, mac2).then(function(res) {
				if (!res || !res.ok) {
					ui.addNotification(null,
						E('p', (res && (res.error || res.output)) || _('Failed to apply WAN mode.')),
						'error');
					return;
				}

				currentStatus = res;
				selectedMode = normalize_mode(currentStatus, modes);
				set_selected(wan1Sel, currentStatus.wan);
				set_selected(wan2Sel, currentStatus.wan2);
				sync_ui();
				update_metrics(currentStatus);

				ui.addNotification(null,
					E('p', _('WAN mode applied. Network/firewall restart is scheduled.')),
					'info');

				window.setTimeout(refresh_status, 3000);
				window.setTimeout(refresh_status, 9000);
			}).catch(function(err) {
				const msg = String((err && (err.message || err)) || '');
				if (msg.toLowerCase().indexOf('aborted') >= 0) {
					ui.addNotification(null,
						E('p', _('Request was interrupted while services restarted. Wait a few seconds, then click Refresh.')),
						'warning');
					return;
				}

				ui.addNotification(null, E('p', msg || _('Apply failed.')), 'error');
			}).finally(function() {
				applyBtn.disabled = false;
			});
		}));

		sync_ui();
		update_metrics(currentStatus);

		return E('div', { class: 'cwm-page' }, [
			E('section', { class: 'cwm-panel cwm-hero' }, [
				E('div', { class: 'cwm-head' }, [
					E('div', {}, [
						E('h2', { class: 'cwm-title' }, [ _('CR881x WAN Mode') ]),
						E('div', { class: 'cwm-subtitle' }, [
							_('Switch WAN/LAN port roles with live status and preview. Changes are applied via /usr/sbin/cr881x-wan-mode.')
						])
					]),
					E('div', { class: 'cwm-actions', style: 'margin-top:0;' }, [ refreshBtn ])
				]),
				E('div', { class: 'cwm-metrics' }, [
					boardMetric.node,
					modeMetric.node,
					wanMetric.node,
					wan2Metric.node,
					lanMetric.node
				])
			]),
			E('div', { class: 'cwm-main' }, [
				E('section', { class: 'cwm-panel' }, [
					E('h3', { style: 'margin:0 0 8px;' }, [ _('Target Layout') ]),
					E('div', { class: 'cwm-mode-grid' }, [ modeCardsWrap ]),
					E('div', { class: 'cwm-field-grid' }, [ wan1Row, wan2Row, autoMacRow, wan1MacRow, wan2MacRow ]),
					E('div', { style: 'margin-top:10px;' }, [ validationNode ]),
					E('div', { class: 'cwm-preview' }, [
						E('div', { class: 'cwm-row' }, [
							E('span', { class: 'cwm-k' }, [ _('Preview mode') ]),
							previewMode
						]),
						E('div', { class: 'cwm-row' }, [
							E('span', { class: 'cwm-k' }, [ _('WAN1') ]),
							previewWan1
						]),
						E('div', { class: 'cwm-row' }, [
							E('span', { class: 'cwm-k' }, [ _('WAN2') ]),
							previewWan2
						]),
						E('div', { class: 'cwm-row' }, [
							E('span', { class: 'cwm-k' }, [ _('br-lan ports') ]),
							previewLan
						])
					]),
					E('div', { class: 'cwm-actions' }, [ applyBtn ])
				]),
				E('div', { class: 'cwm-side' }, [
					E('section', { class: 'cwm-panel cwm-help' }, [
						E('h3', { style: 'margin:0 0 8px;color:inherit;' }, [ _('Notes') ]),
						E('div', {}, [
							_('Single WAN keeps one dedicated uplink. Dual WAN configures both wan and wan2 interfaces for multi-WAN policies.')
						]),
						E('div', { style: 'margin-top:8px;' }, [
							_('If LuCI temporarily disconnects during apply, wait for service restart and click Refresh.')
						]),
						E('div', { style: 'margin-top:8px;' }, [
							_('Dual WAN should use distinct MAC addresses. You can set them manually in network config or enable auto-generate.')
						]),
						E('div', { style: 'margin-top:8px;' }, [
							_('Helper path: '),
							E('code', { style: 'font-size:12px;word-break:break-all;' }, [ info.helper || '/usr/sbin/cr881x-wan-mode' ])
						])
					]),
					E('section', { class: 'cwm-panel cwm-raw' }, [
						E('h3', { style: 'margin:0 0 8px;' }, [ _('Raw Runtime Status') ]),
						rawBox
					])
				])
			])
		]);
	}
});
