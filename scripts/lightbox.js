/* ========================================================================
 * Ligthtbox for Bootstrap, heavily built upon Bootstrap Modal
 * http://spektrakel.de
 * ========================================================================
 * Copyright 2014 David Herges
 * Licensed under MIT (https://github.com/dherges)
 * ======================================================================== */


+function ($) {
  'use strict';

  // LIGHTBOX CLASS DEFINITION
  // ======================

  var Lightbox = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null

    if (this.options.remote) {
      this.$element
        .find('.lightbox-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.lightbox')
        }, this))
    }
  }

  Lightbox.VERSION  = '3.2.0'

  Lightbox.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Lightbox.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Lightbox.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.lightbox', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.$body.addClass('lightbox-open')

    this.escape()

    this.$element.on('click.dismiss.bs.lightbox', '[data-dismiss="lightbox"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move lightboxs dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.lightbox', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.lightbox') // wait for lightbox to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Lightbox.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.lightbox')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.$body.removeClass('lightbox-open')

    this.escape()

    $(document).off('focusin.bs.lightbox')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.lightbox')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideLightbox, this))
        .emulateTransitionEnd(300) :
      this.hideLightbox()
  }

  Lightbox.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.lightbox') // guard against infinite focus loop
      .on('focusin.bs.lightbox', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Lightbox.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.lightbox', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.lightbox')
    }
  }

  Lightbox.prototype.hideLightbox = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.lightbox')
    })
  }

  Lightbox.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Lightbox.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="lightbox-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.find('.lightbox-content').on('click.dismiss.bs.lightbox',
        $.proxy(function (e) {
          if (e.target !== e.currentTarget) return
          this.options.backdrop == 'static'
            ? this.$element[0].focus.call(this.$element[0])
            : this.hide.call(this)
        }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }


  // LIGHTBOX PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.lightbox')
      var options = $.extend({}, Lightbox.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.lightbox', (data = new Lightbox(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.lightbox

  $.fn.lightbox             = Plugin
  $.fn.lightbox.Constructor = Lightbox


  // LIGHTBOX NO CONFLICT
  // =================

  $.fn.lightbox.noConflict = function () {
    $.fn.lightbox = old
    return this
  }


  // LIGHTBOX DATA-API
  // ==============

  $(document).on('click.bs.lightbox.data-api', '[data-toggle="lightbox"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.lightbox') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.lightbox', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if lightbox will actually get shown
      $target.one('hidden.bs.lightbox', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

