'use strict';

var translator = {};

translator.getText = function (string) {
    var ret = dic[string];
    return ret == undefined ? string : ret;
}

var dic = {
    'Warrior': '战士'
}