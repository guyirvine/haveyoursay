/*jslint browser: true*/
/*jslint nomen: true */
/*jslint node: true */

/*global $, _, jQuery, alert, console, moment, UUIDjs, c3, d3, ds, Vue */

"use strict";

var app = {};

app.card_idx = {};
app.todo = [];
app.doing = [];
app.done = [];

var vue_card;

var guy_card;
app.card_view = function (id) {
    var html_card, popup, card; //, comments, comment;

    html_card = $('.templates .commentcard').clone();
    card = app.card_idx[id];
    guy_card = card;
    console.log('app.card_view.1 ', card);

    popup = $('.container .popup');

    popup.removeClass('hide');
    popup.empty();
    popup.append(html_card);
    popup.find('.question textarea').focus();

    vue_card = new Vue({
        el: '.container .popup .commentcard',
        data: { 'card': card, 'admin': $('body').hasClass('admin') },
        filters: {
            datestamp: function (date) {
                return moment(date).format('D MMMM YYYY');
            },
            timestamp: function (date) {
                return moment(date).format('D MMM YYYY, h:mm:ss a');
            }
        }
    });

    $('body').addClass('showpopup');
};

app.new_cards = {};
app.show_newcard = function () {
    var card, popup;

    card = $('.templates .newcard').clone();

    $('body').addClass('showpopup');

    card.find('.action a.cancel').on('click', function () {
        window.location.hash = 'board';
        return false;
    });

    card.find('.action a.create').on('click', function () {
        if (card.find('.question textarea').val().trim().length === 0) {
            card.find('.question textarea').removeClass('highlight');
            card.find('.question textarea').addClass('highlight');
            card.find('.question textarea').focus();
            return false;
        }

        ds.create_card(card.find('.question textarea').val(),
                       card.find('.why textarea').val(),
                       app.vue_board.slt_member.id,
                       function (new_id) {
                app.new_cards['card-' + new_id] = 1;
                ds.get_card(new_id, function (card) {
                    app.initialise_card(card);
                    app.vue_board.cards.push(card);
                    console.log('ds.create_card.1 ');
                    setTimeout(function () {
                        $('#card-' + card.id).removeClass('highlight');
                        $('#card-' + card.id).addClass('highlight');
                    }, 500);
                });

                window.location.hash = 'board';
            });
        return false;
    });

    popup = $('.container .popup');

    popup.removeClass('hide');
    popup.empty();
    popup.append(card);
    card.find('.question textarea').focus();
};

app.board_view = function () {
    console.log('board_view');
    $('body').addClass('showboard');
};

app.initialise_card = function (card) {
    app.card_idx[card.id] = card;
    card.liked_in_session = false;

    card.newness = function () {
        var days = moment().diff(moment(card.createdon), 'days');

        if (moment().diff(moment(card.createdon), 'hours') < 24) {
            return 'newest-card';
        }
        if (days < 7) {
            return 'new-card';
        }
        if (days < 14) {
            return 'newish-card';
        }

        return '';
    };

    card.newness_blurb = function () {
        var days, hours;
        if (card.newness() === 'newest-card') {
            hours = moment().diff(moment(card.createdon), 'hours');
            if (hours === 0) {
                return 'Just now. ';
            }
            if (hours === 1) {
                return '1 hour ago. ';
            }
            return hours + ' hours ago. ';
        }

        if (card.newness() === 'new-card' || card.newness() === 'newish-card') {
            days = moment().diff(moment(card.createdon), 'days');
            if (days === 1) {
                return '1 day ago. ';
            }
            return days + ' days ago. ';
        }

        return '';
    };

    card.question_summary = function () {
        var question_summary, idx;
        question_summary = card.question;
        idx = question_summary.indexOf("\n");
        if (idx > -1 && idx < 80) {
            question_summary = question_summary.substring(0, idx);
        }
        if (question_summary > 80) {
            question_summary = card.question.substring(0, 78);
            question_summary += "&#8230;";
        }

        return question_summary;
    };

    card.view_card = function () {
        window.location.hash = '#card-' + card.id;
    };

    card.is_liked_in_session = function () {
        return card.liked_in_session === true;
    };

    card.likes = Number(card.likes);
    card.click_like = function () {
        if (card.liked_in_session === false) {
            card.likes += 1;
            card.liked_in_session = true;
        } else {
            card.likes -= 1;
            card.liked_in_session = false;
        }
        ds.update_card_likes(card.id, card.likes);
        return false;
    };

    card.edit_card = function () {
        $('.popup .card2').removeClass('displaycard');
        $('.popup .card2').addClass('editcard');
        $('.popup .card2 .lookingintoit textarea').focus();
        return false;
    };

    card.update_card = function () {
        $('.popup .card2').removeClass('editcard');
        $('.popup .card2').addClass('displaycard');
/*
        ds.update_card_details(card.id,
                                card.question,
                                card.why,
                                card.lookingintoit,
                                card.whatwedid);
                                */
        ds.update_card_response(card.id,
                                card.lookingintoit,
                                card.whatwedid);

        window.location.hash = 'board';
        return false;
    };

    card.cancel_update_card = function () {
        $('.popup .card2').removeClass('editcard');
        $('.popup .card2').addClass('displaycard');
    };

    card.close_card = function () {
        $('#card-' + card.id).removeClass('highlight');
        $('#card-' + card.id).addClass('highlight');
    };

    card.new_comment = function () {
        $('.popup .card2 .comments textarea').val('');
        $('.popup .card2').removeClass('displaycard');
        $('.popup .card2').addClass('newcomment');
        $('.popup .card2 .comments textarea').focus();
        return false;
    };

    card.cancel_comment = function () {
        $('.popup .card2').addClass('displaycard');
        $('.popup .card2').removeClass('newcomment');
        return false;
    };

    card.update_comment = function () {
        if ($('.popup .commentcard textarea').val().trim() === '') {
            $('.popup .commentcard textarea').removeClass('highlight');
            $('.popup .commentcard textarea').addClass('highlight');
            return false;
        }

        ds.add_comment(card.id, $('.popup .commentcard textarea.newcomment').val());
        card.comments.unshift({'createdon': moment().format("D MMM YYYY h:mma"), 'description': $('.popup .commentcard textarea.newcomment').val() });

        return false;
    };

    card.searchcriteria = function () {
        return card.question.toUpperCase();
    };
};

app.load_board = function () {
    var html_board, boardcard2;

    html_board = $('.templates .board2').clone();
    boardcard2 = $('.templates .boardcard2');
    html_board.find('.todo .list').append(boardcard2.clone());
    html_board.find('.doing .list').append(boardcard2.clone());
    html_board.find('.done .list').append(boardcard2.clone());

    $('.content').empty();
    $('.content').append(html_board);

    _.each(app.cards, function (card) {
        app.initialise_card(card);
    });

    app.vue_board = new Vue({
        el: '.container',
        data: { 'cards': app.cards, 'searchcriteria': '', 'sltlist': app.slt },
        computed: {
            slt_member: function () {
                return _.find(app.slt, function (el) {
                    return moment().startOf('day').isBetween(moment(el.startdate), moment(el.enddate), null, '[]');
                });
            },
            sorted_cards: function () {
                return _.sortBy(this.cards, 'createdon').reverse();
            }
        },
        methods: {
            todoMethod: function (card) {
                return (card.whatwedid === "" && card.lookingintoit === "");
            },
            doingMethod: function (card) {
                return (card.whatwedid === "" && card.lookingintoit !== "");
            },
            doneMethod: function (card) {
                return (card.whatwedid !== "");
            },
            searchMethod: function (card) {
                console.log('searchMethod.1 ', this.searchcriteria);
                return (card.searchcriteria().indexOf(this.searchcriteria.toUpperCase()) > -1);
            },
            show_slt_member: function () {
                window.location.hash = 'schedule-' + this.slt_member.id;
            }
        }
    });

    $('.navbar nav .contact').attr('href', 'mailto:' + app.vue_board.slt_member.email_address);
};

app.matchs = function (el, criteria) {
    if ($(el).find('.searchlookup').text().indexOf(criteria) > -1) {
        return true;
    }

    return false;
};

app.search = function () {
    window.location.hash = 'search';
};

app.search_view = function () {
    console.log('app.search_view.1');
    $('body').addClass('showsearch');
    app.search();
};

app.schedule_view = function (id) {
//    var schedule, _tr, table;

    $('body').addClass('showschedule');

    var schedule = $('.templates .schedule').clone();

    $('.popup').empty();
    $('.popup').append(schedule);
    $('.popup').removeClass('hide');

    vue_card = new Vue({
        el: '.container .popup .schedule',
        data: { 'sltlist': app.slt },
        filters: {
            daterange: function (slt) {
                return moment(slt.startdate).format('MMM Do') + ' - ' + moment(slt.enddate).format('MMM Do');
            }
        }
    });

    if (id !== undefined && id !== "") {
        $("#slt-" + id)[0].scrollIntoView();
    }
};

app.check_password = function (username, password, callback) {
    console.log('app.check_password.1 ', username, password);
    $.post('/session', { password: password }, function (data) {
        console.log('app.check_password.1.1 ', data);
        $.cookie("session_key", data.session_key);
        callback(true);
    }, 'json')
        .error(function (data) {
            console.log('app.check_password.1.2 ', data);
            callback(false);
        });
};

app.login_view = function () {
    var login;

    $('body').addClass('showlogin');

    login = $('.templates .login').clone();

    login.find('.loginbutton').on('click', function () {
        app.check_password(login.find('.username').val(), login.find('.password').val(), function (successful) {
            console.log('app.login_view.1 ', successful);
            if (successful === true) {
                $('body').addClass('admin');
                window.location.hash = 'board';
            } else {
                login.find('.note').text('Username / Password combination not recognised');
            }
        });
        return false;
    });

    $('.popup').empty();
    $('.popup').append(login);
    $('.popup').removeClass('hide');
    login.find('.password').focus();
};

app.show_view = function (hash) {
    var routes, hashParts, viewFn;

    $('body').removeClass('showpopup');
    $('body').removeClass('showboard');
    $('body').removeClass('showschedule');
    $('body').removeClass('showlogin');
    $('body').removeClass('showsearch');

    if (hash === "") {
        window.location.hash = "#board";
        return;
    }

    routes = {
        '#search': app.search_view,
        '#card': app.card_view,
        '#newcard': app.show_newcard,
        '#board': app.board_view,
        '#schedule': app.schedule_view,
        '#login': app.login_view
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

    ds.get_slt(function (list) {
        app.slt = list;
//        app.set_current_slt();

        ds.get_cards(function (list) {
            app.cards = list;
            app.load_board();
        });
    });

    window.onhashchange = function () {
        app.show_view(window.location.hash);
    };

    window.location.hash = 'board';

    $('.searchcriteria').keyup(function () {
        app.search();
    });

    $('.logout').on('click', function () {
        console.log('logout.1');
        $.cookie("session_key", null);
        $.post('/session/close', {}, function (data) {
            console.log('/session/close.1 ', data);
        });
        $('body').removeClass('admin');
    });

    app.board_view();
    app.show_view(window.location.hash);
};

/* jshint ignore:end */
$(document).keyup(function (e) {
    if (e.keyCode === 27) { // escape key maps to keycode `27`
        window.location.hash = 'board';
    }
});
