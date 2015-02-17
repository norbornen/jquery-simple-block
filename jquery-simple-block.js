/*
	$.fn.qlock
		@description	упрощённый аналог element blocking плагина jquery.blockUI
		@param			params.message		текст сообщения
		@param			params.click		разблокировка при клике на блокиратор
		@param			params.timeout		блокировка автоматически снимется через params.timeout миллисекунд
		@param			params.onBlock		запускается после установки блокировки
		@param			params.onUnBlock	запускается после разблокировки
		@param			params.onClick		обработчик клика на блокиратор
		
		@example		$('.list-group-item').qlock('Удалено!');
		@example		$('.list-group:eq(1)').qlock({'message': 'Удалено!', 'click': 1, 'onUnBlock': function(){banzai.alert('a')}});

	$.fn.uqlock
		@description	разблокирует элемент заблокированный qlock-ом
*/
(function ($) {
	var tmpl = '\
		<div role="qlock" qlock-id="<%= params.id %>" class="clearfix" unselectable="on" style="width:100%;position:absolute;top:0;right:0;bottom:0;left:0;z-index:1000;background-color:#000;opacity:.75;filter:alpha(opacity=75);">\
			<% if (params.message) { %><div style="position:relative;right:50%;float:right;"><div unselectable="on" style="position:relative;z-index:1001;right:-50%;color:#fff;"><%= params.message %></div></div><% } %>\
		</div>\
	';
	$.fn.qlock = function(params) {
		!(params)	&& (params = {});
		params		&& _.isString(params) && (params = {'message': params});
		this.each(function(){
			var parent = $(this), ptagName = parent.get(0).tagName,
				qlockId, el;

			if (parent.data('qlock')) {
				return;
			}

			qlockId = _.uniqueId('qlock');
			el = $(qwx.u.template(tmpl, {'params': _.extend({'id': qlockId}, params)})),
			/*
				Запоминаем идентификатор блокиратора
			*/
			parent.data('qlock', qlockId);
			
			/*
				Делаем элемент неселектабельным
			*/
			el.on('selectstart', function(){ return false });

			/*
				Присоединение блокиратора
					если это не TR - простое присоединение
					если это TR - присоединение к каждой TD этого TR
			*/
			var appender = function(p, q) {
				p.append(q);
				if (p.css('position') === 'static') {
					p.css('position', 'relative');
				}

				var div = q.find('>div'),
					marginTop = parseInt((q.innerHeight() - div.outerHeight())/2, 10);
				if (marginTop > 0) {
					div.css('marginTop', marginTop + 'px');
				}
			};
			if (ptagName !== 'TR') {
				appender(parent, el);
			} else {
				parent.find('> td').each(function(){
					appender($(this), el.clone(true));
				});
			}

			/*
				Навешивание и запуск обработчиков событий
			*/
			if (params.onBlock) {
				params.onBlock.call(parent);
			}
			if (params.onUnBlock) {
				parent.off('uqlock').on('uqlock', function(){
					params.onUnBlock.call(parent);
				});
			}
			if (params.onClick) {
				parent.on('click', '[qlock-id="' + qlockId +  '"]', function(){ params.onClick.call(this) });
			}
			if (params.click) {
				parent
					.find('[qlock-id="' + qlockId +  '"]').css('cursor', 'pointer').attr('title', 'Кликните чтобы отменить действие')
					.end()
					.on('click', '[qlock-id="' + qlockId +  '"]', function(){parent.uqlock()})
					.on('mouseenter', '[qlock-id="' + qlockId +  '"]', function(){ $(this).css('opacity', 0.55) })
					.on('mouseleave', '[qlock-id="' + qlockId +  '"]', function(){ $(this).css('opacity', 0.75) });
			}
			if (params.timeout) {
				setTimeout(function(){parent.uqlock()}, params.timeout);
			}
		});
		return this;
	};
	$.fn.uqlock = function() {
		this.each(function(){
			var parent = $(this),
				qlockId = parent.data('qlock'),
				lock = qlockId ? parent.find('[qlock-id="' + qlockId +  '"]') : undefined;

			if (!lock || lock.length == 0) {
				if (qlockId) {
					console.warn("Not found qlock=" + qlockId  + " inside element", this);
				}
			} else {
				lock.remove();
				parent.removeData('qlock').trigger('uqlock').off('uqlock');
			}
		});
		return this;
	};
}(jQuery));
