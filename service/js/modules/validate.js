/*
* module for form validation.
* add attribute data-vbs-validate to form field.
* Format: data-vbs-validate="sentence1,sentence2[param1,param2],ignore[sentense]"
* Example: data-vbs-validate="required,ignore[invisible]"
* You can calling validator: VB.validator.validate($form) // $form is jQuery object
* */
voiceBase = (function(VB, $) {
    "use strict";

    VB.validator = {

        validate: function($form) {
            var fields = $form.find('[data-vbs-validate]');
            var errors = [];
            fields.each(function() {
                var $field = $(this);
                var resultRules = VB.validator.getRules($field);
                var rules = resultRules.rules;
                var isIgnore = false;
                if(resultRules.ignoreRule) {
                    isIgnore = VB.validator.conditions.ignore($field, resultRules.ignoreRule.params[0]);
                }
                if(!isIgnore && rules) {
                    rules.forEach(function(rule, i) {
                        var result = VB.validator.conditions[rule.name]($field, rule.params);
                        if(!result){
                            var msg = VB.validator.getMessage(rule.name, rule.params);
                            errors.push({
                                field: $field,
                                rule: rule.name,
                                message: msg
                            });
                        }
                    });
                }
            });

            if(errors.length > 0) {
                VB.validator.clearMessages($form);
                VB.validator.showMessages(errors);
                return false;
            }

            return true;
        },

        clearMessages: function($form) {
            $form.find('.vbs-msg').remove();
        },

        showMessages: function(errors) {
            errors.forEach(function(error) {
                var $field = error.field;
                var msg = VB.validator.createMessage(error.message);
                $field.after(msg);
            });
        },

        createMessage: function(message) {
            var msg = '<div class="vbs-msg vbs-msg-alert">' + message + '</div>';
            return msg;
        },

        getRules: function($field) {
            var attr = $field.attr('data-vbs-validate');
            var result = {};
            if(attr) {
                var rules = [];
                var _rules = attr.split(',');
                _rules.forEach(function(ruleAttr) {
                    var ruleParams = ruleAttr.trim().split(/\[|,|\]/);

                    for (var i = 0; i < ruleParams.length; i++) {
                        ruleParams[i] = ruleParams[i].replace(" ", "");
                        // Remove any parsing errors
                        if (ruleParams[i] === '') {
                            ruleParams.splice(i, 1);
                        }
                    }
                    if(ruleParams.length > 0) {
                        var rule = {};
                        rule.name = ruleParams[0];
                        ruleParams.splice(0, 1);
                        rule.params = ruleParams;

                        if(VB.validator.conditions[rule.name]) {
                            if(rule.name === 'ignore') {
                                result.ignoreRule = rule;
                            }
                            else {
                                rules.push(rule);
                            }
                        }
                    }
                });
                result.rules = rules;
                return (result.rules.length > 0) ? result : null;
            }

            return null;
        },

        getValue: function($elem) {
            var value;
            switch ($elem.prop("type")) {
                case "radio":
                case "checkbox":
                    value = $elem.is(':checked');
                    break;
                default:
                    value = $elem.val();
            }
            return value;
        },

        getMessage: function(rule, params) {
            var message = (VB.validator.messages[rule]) ? VB.validator.messages[rule] : '';
            for (var i = 0; i < params.length; i++) {
                var rex = new RegExp("{{\\s*" + "param" + (i + 1) + "\\s*}}", "gi");
                message = message.replace(rex, params[i]);
            }
            if(message) {
                message = '* ' + message;
            }
            return message;
        },

        conditions: {
            required: function($elem) {
                var value = VB.validator.getValue($elem);
                return !!(value !== null && value !== '');
            },

            minSize: function($elem, params) {
                var size = parseInt(params[0]);
                var value = VB.validator.getValue($elem);
                var length = value.length || 0;
                return (length >= size);
            },

            maxSize: function($elem, params) {
                var size = parseInt(params[0]);
                var value = VB.validator.getValue($elem);
                var length = value.length || 0;
                return (length <= size);
            },

            visible: function($elem) {
                return $elem.is(':visible');
            },

            ignore: function($elem, type) {
                if(type === 'invisible') {
                    var isElemVisible = VB.validator.conditions.visible($elem);
                    return !isElemVisible;
                }
            }
        },

        messages: {
            required: 'This field is required',
            minSize: '{{ param1 }} characters required',
            maxSize: '{{ param1 }} characters allowed'
        }

    };

    return VB;
})(voiceBase, jQuery);