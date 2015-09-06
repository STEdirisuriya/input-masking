var masking = {

  // Default Values
  defaults: {
    masked : '.masked',
    maskedNumber : 'XdDmMyY9',
    maskedLetter : '_',
    error: function(){}
  },

  init: function ( options ) {
    if ( options && options.masked ) {
      // Make it easy to wrap this plugin and pass elements instead of a selector
      options.masked = typeof options.masked === string ? document.querySelectorAll( options.masked ) : options.masked;
    }

    if ( options ) {
      this.options = {
        masked: options.masked || document.querySelectorAll( this.defaults.masked ),
        maskedNumber: options.maskedNumber || this.defaults.maskedNumber,
        maskedLetter: options.maskedLetter || this.defaults.maskedLetter,
        error: options.onError || this.defaults.onError
      }
    } else {
      this.options = this.defaults;
      this.options.masked = document.querySelectorAll( this.options.masked );
    }

    this.refresh( true );
  },

  refresh: function( init ) {
    var input, parentClass;

    if ( !init ) {
      this.options.masked = document.querySelectorAll( this.options.masked );
    }

    for(i = 0; i < this.options.masked.length; i++) {
      input = this.options.masked[i]
      parentClass = input.parentNode.getAttribute('class');

      if ( !parentClass || ( parentClass && parentClass.indexOf( 'shell' ) === -1 ) ) {
        this.createShell(input);
        this.activateMasking(input);
      }
    }
  },

  // replaces each masked input with a shall containing the input and it's mask.
  createShell : function (input) {
    var wrap = document.createElement('span'),
        mask = document.createElement('span'),
        emphasis = document.createElement('i'),
        placeholderText = input.getAttribute('placeholder'),
        placeholder = document.createTextNode(placeholderText);

    input.setAttribute('maxlength', placeholder.length);
    input.setAttribute('data-placeholder', placeholderText);
    input.removeAttribute('placeholder');

    mask.setAttribute('aria-hidden', 'true');
    mask.setAttribute('id', input.getAttribute('id') + 'Mask');
    mask.appendChild(emphasis);
    mask.appendChild(placeholder);

    wrap.setAttribute('class', 'shell');
    wrap.appendChild(mask);
    input.parentNode.insertBefore( wrap, input );
    wrap.appendChild(input);
  },

  setValueOfMask : function (e) {
    var value = e.target.value,
        placeholder = e.target.getAttribute('data-placeholder');

    return "<i>" + value + "</i>" + placeholder.substr(value.length);
  },

  // add event listeners
  activateMasking : function (input) {
    var that = this;
    if (input.addEventListener) { // remove "if" after death of IE 8
      input.addEventListener('keyup', this.handleValueChange, false);
    } else if (input.attachEvent) { // For IE 8
        input.attachEvent("onkeyup", function(e) {
        e.target = e.srcElement;
        that.handleValueChange(e);
      });
    }
  },

  handleValueChange : function (e) {
    var id = e.target.getAttribute('id');

    switch (e.keyCode) { // allows navigating thru input
      case 20: // caplocks
      case 17: // control
      case 18: // option
      case 16: // shift
      case 37: // arrow keys
      case 38:
      case 39:
      case 40:
      case  9: // tab (let blur handle tab)
        return;
      }

    document.getElementById(id).value = masking.handleCurrentValue(e);
    document.getElementById(id + 'Mask').innerHTML = masking.setValueOfMask(e);

  },

  handleCurrentValue : function (e) {
    var isCharsetPresent = e.target.getAttribute('data-charset'),
        placeholder = isCharsetPresent || e.target.getAttribute('data-placeholder'),
        value = e.target.value, l = placeholder.length, newValue = '',
        i, j, isInt, isLetter, strippedValue;

    // strip special characters
    strippedValue = isCharsetPresent ? value.replace(/\W/g, "") : value.replace(/\D/g, "");

    for (i = 0, j = 0; i < l; i++) {
        isInt = !isNaN(parseInt(strippedValue[j]));
        isLetter = strippedValue[j] ? strippedValue[j].match(/[A-Z]/i) : false;
        matchesNumber = this.options.maskedNumber.indexOf(placeholder[i]) >= 0;
        matchesLetter = this.options.maskedLetter.indexOf(placeholder[i]) >= 0;
        if ((matchesNumber && isInt) || (isCharsetPresent && matchesLetter && isLetter)) {
                newValue += strippedValue[j++];
          } else if ((!isCharsetPresent && !isInt && matchesNumber) || (isCharsetPresent && ((matchesLetter && !isLetter) || (matchesNumber && !isInt)))) {
                this.options.onError( e ); // write your own error handling function
                return newValue;
        } else {
            newValue += placeholder[i];
        }
        // break if no characters left and the pattern is non-special character
        if (strippedValue[j] == undefined) {
          break;
        }
    }
    if (e.target.getAttribute('data-valid-example')) {
      return this.validateProgress(e, newValue);
    }
    return newValue;
  },

  validateProgress : function (e, value) {
    var validExample = e.target.getAttribute('data-valid-example'),
        pattern = new RegExp(e.target.getAttribute('pattern')),
        placeholder = e.target.getAttribute('data-placeholder'),
        l = value.length, testValue = '';

    //convert to months
    if (l == 1 && placeholder.toUpperCase().substr(0,2) == 'MM') {
      if(value > 1 && value < 10) {
        value = '0' + value;
      }
      return value;
    }
    // test the value, removing the last character, until what you have is a submatch
    for ( i = l; i >= 0; i--) {
      testValue = value + validExample.substr(value.length);
      if (pattern.test(testValue)) {
        return value;
      } else {
        value = value.substr(0, value.length-1);
      }
    }

    return value;
  }
};

//  Declaritive initalization
(function(){
  var scripts = document.getElementsByTagName('script'),
      script = scripts[ scripts.length - 1 ];
  if ( script.getAttribute('data-autoinit') ) {
    masking.init();
  }
})();

