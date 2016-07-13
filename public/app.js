/*jslint browser: true*/
/*jslint nomen: true */
/*jslint node: true */

/*global $, _, jQuery, alert, console, moment, UUIDjs, c3, d3 */

"use strict";

var app = {};

app.show_view = function (hash) {
    var routes, hashParts, viewFn;

    if (hash === "") {
        window.location.hash = "#board";
        return;
    }

    routes = {
        '#search': app.search_view,
        '#card': app.card_view,
        '#board': app.board_view
    };

    hashParts = hash.split('-');
    hashParts[1] = hashParts.slice(1).join('-');
    viewFn = routes[hashParts[0]];
    console.log("viewFn: ", hashParts[0], hashParts[1]);
    if (viewFn) {
        $('.popup').addClass('hide');
        $('.view-container').empty().append(viewFn(hashParts[1]));
    }
};

app.apponready = function () {
    app.load_board();

    window.onhashchange = function () {
        app.show_view(window.location.hash);
    };

    if (window.location.hash === "") {
        window.location.hash = 'board';
        return;
    }

    $('.searchcriteria').keyup(function (e) {
        app.search();
    });

    app.board_view();
    app.show_view(window.location.hash);
};

app.display_card = function () {
    var card = $('.templates .card').clone();
    card.find('.action a.edit').on('click', function () {
        card.find('.question textarea').val(card.find('.question .input').text());
        card.find('.why textarea').val(card.find('.why .input').text());
        card.find('.lookingintoit textarea').val(card.find('.lookingintoit .input').text());
        card.find('.whatwedid textarea').val(card.find('.whatwedid .input').text());

        card.addClass('editcard');
        return false;
    });
    card.find('.action a.cancel').on('click', function () {
        card.removeClass('editcard');
        return false;
    });
    card.find('.action a.update').on('click', function () {
        card.find('.question .input').text(card.find('.question textarea').val());
        card.find('.why .input').text(card.find('.why textarea').val());
        card.find('.lookingintoit .input').text(card.find('.lookingintoit textarea').val());
        card.find('.whatwedid .input').text(card.find('.whatwedid textarea').val());
        card.removeClass('editcard');
        return false;
    });
    $('.content').append(card);
};

app.cards = [
    {
        'id': 1,
        'color': 'blue',
        'question': 'First Title',
        'why': 'Why 1',
        'lookingintoit': '',
        'whatwedid': ''
    },
    {
        'id': 2,
        'color': 'blue',
        'question': 'Second Title',
        'why': 'Why 2',
        'lookingintoit': 'lookingintoit 2',
        'whatwedid': ''
    },
    {
        'id': 3,
        'color': 'green',
        'question': 'Third Title',
        'why': 'Why 3',
        'lookingintoit': 'lookingintoit 3',
        'whatwedid': 'whatwedid 3'
    },
    {
        'id': 4,
        'color': 'blue',
        'question': 'Fourth Title',
        'why': 'Why 4',
        'lookingintoit': 'lookingintoit 4',
        'whatwedid': 'whatwedid 4'
    }
];

app.card_view = function (id) {
    if (id === 'new') {
        app.new_card();
        return;
    }

    var card, popup, _c;

    _c = $('#card-' + id);
    card = $('.templates .card').clone();

    _.each(['blue', 'green'], function (color) {
        if (_c.hasClass(color)) {
            card.addClass(color);
        }
    });

    card.find('.question .input').text(_c.find('.question').text());
    card.find('.why .input').text(_c.find('.why').text());
    card.find('.lookingintoit .input').text(_c.find('.lookingintoit').text());
    card.find('.whatwedid .input').text(_c.find('.whatwedid').text());

    card.find('.action a.edit').on('click', function () {
        card.find('.question textarea').val(card.find('.question .input').text());
        card.find('.why textarea').val(card.find('.why .input').text());
        card.find('.lookingintoit textarea').val(card.find('.lookingintoit .input').text());
        card.find('.whatwedid textarea').val(card.find('.whatwedid .input').text());

        card.addClass('editcard');
        card.find('.question textarea').focus();
        return false;
    });
    card.find('.action a.cancel').on('click', function () {
        card.removeClass('editcard');
        return false;
    });
    card.find('.action a.update').on('click', function () {
        card.find('.question .input').text(card.find('.question textarea').val());
        card.find('.why .input').text(card.find('.why textarea').val());
        card.find('.lookingintoit .input').text(card.find('.lookingintoit textarea').val());
        card.find('.whatwedid .input').text(card.find('.whatwedid textarea').val());

        _c.find('.question').text(card.find('.question textarea').val());
        _c.find('.why').text(card.find('.why textarea').val());
        _c.find('.lookingintoit').text(card.find('.lookingintoit textarea').val());
        _c.find('.whatwedid').text(card.find('.whatwedid textarea').val());

        app.position_card_on_board(_c);

        window.location.hash = 'board';
//        card.removeClass('editcard');
//        card.addClass('hide');
        return false;
    });

    popup = $('.container .popup');

    popup.removeClass('hide');
    popup.empty();
    popup.append(card);
};

app.new_card = function () {
    var card, popup, color;

    card = $('.templates .card').clone();

    color = 'blue';
    card.addClass(color);
    card.addClass('newcard');
    card.find('.action a.cancel').on('click', function () {
        card.addClass('hide');
        return false;
    });
    card.find('.action a.update').on('click', function () {
        var new_id, _c, question, question_summary;
        question = card.find('.question textarea').val();
        if (question.length > 80) {
            question_summary = question.substring(0,78);
            question_summary += "&#8230;";
        }

        new_id = 'card-' + app.generate_uuid();
        _c = $('.templates .boardcard').clone();
        _c.attr('id', new_id);
        _c.addClass(color);
        _c.find('.question').text(card.find('.question textarea').val());
        _c.find('.question_summary').html(question_summary);
        _c.find('.why').text(card.find('.why textarea').val());
        _c.find('.lookingintoit').text(card.find('.lookingintoit textarea').val());
        _c.find('.whatwedid').text(card.find('.whatwedid textarea').val());
        _c.on('click', function () {
            window.location.hash = new_id;
        });

        app.position_card_on_board(_c);

        card.addClass('hide');
        return false;
    });

    popup = $('.container .popup');

    popup.removeClass('hide');
    popup.empty();
    popup.append(card);
    card.find('.question textarea').focus();
};

app.position_card_on_board = function (card) {
//  card.remove();

    if (card.find('.whatwedid').text() !== "") {
        app.board.find('.done').append(card);
    } else if (card.find('.lookingintoit').text() !== "") {
        app.board.find('.doing').append(card);
    } else {
        app.board.find('.todo').append(card);
    }
};

app.board_view = function () {
    console.log('board_view');
};

app.load_board = function () {
    console.log(' ')
    var _card;

    app.board = $('.templates .board').clone();
    _card = $('.templates .boardcard');
    _.each(app.cards, function (el) {
        var card, question_summary;

        var card = _card.clone();
        var question_summary = el.question;
        if (el.question.length > 80) {
            question_summary = el.question.substring(0,78);
            question_summary += "&#8230;";
        }
        card.attr('id', 'card-' + el.id);
        card.addClass(el.color);
        card.find('.question_summary').text(question_summary);
        card.find('.question').text(el.question);
        card.find('.why').text(el.why);
        card.find('.lookingintoit').text(el.lookingintoit);
        card.find('.whatwedid').text(el.whatwedid);
        card.find('.searchlookup').text(el.question.toUpperCase() + ' ' +
                                        el.why.toUpperCase() + ' ' +
                                        el.lookingintoit.toUpperCase() + ' ' +
                                        el.whatwedid.toUpperCase()
                                        );

        card.on('click', function () {
            window.location.hash = 'card-' + el.id;
        });

        app.position_card_on_board(card);
    });

    $('.content').empty();
    $('.content').append(app.board);
};

app.matchs = function (el, criteria) {
    console.log('app.matchs.1.1. ', el, $(el).find('.searchlookup').val(), criteria);
    console.log(criteria);
    if ($(el).find('.searchlookup').text().indexOf(criteria) > -1) {
        return true;
    }

    return false;
};

app.search = function () {
    var criteria, searchresult, popup, ul, _li;
    window.location.hash = 'search';
    console.log('app.search.1');

    if (app.search_running === true) {
        app.search_pending = true;
        return;
    }

    app.search_running = true;
    app.search_pending = false;

    criteria = $('.searchcriteria').val().toUpperCase();
    searchresult = $('.templates .searchresult').clone();
    ul = searchresult.find('ul');
    _li = ul.find('li').remove();

    _.each($('.board .boardcard'), function (el) {
        if (app.matchs(el, criteria)) {
            var li = _li.clone();
            li.find('a')
                .text($(el).find('.question').text())
                .attr('href', '#' + el.id);
            ul.append(li);
        }
    });

    app.search_running = false;
    if (app.search_pending === true) {
        app.search();
    }

    popup = $('.popup');
    popup.empty();
    popup.append(searchresult);
};

app.search_view = function () {
    console.log('app.search_view.1');
    var popup = $('.popup');
    popup.removeClass('hide');
    app.search();
};

/* jshint ignore:start */
app.generate_uuid = function () {
    var d, uuid;

    d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};
/* jshint ignore:end */

$(document).keyup(function (e) {
    if (e.keyCode === 27) { // escape key maps to keycode `27`
        window.location.hash = 'board';
    }
});
