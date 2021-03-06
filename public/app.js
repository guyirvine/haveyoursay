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

app.show_card = function (id) {
    var html_card, popup, card; //, comments, comment;

    html_card = $('.templates .commentcard').clone();
    card = app.card_idx[id];
    console.log('app.show_card.1 ', card);

    popup = $('.popup');
    popup.empty();
    popup.append(html_card);

    vue_card = new Vue({
        el: '.popup',
        data: {
            'card': card,
            'admin': $('body').hasClass('admin'),
            'newcomment': '',
            'whatwedid_pre': card.whatwedid
        },
        computed: {
            mailto_url: function () {
                var subject, main_body, url, body, string;

                subject = encodeURIComponent('Check out this HaveYourSay card');
                main_body = app.question_summary(this.card) + '\n\n';
                url = 'http://haveyoursay.livestock.org.nz/index.htm#card-' + this.card.id;
                body = encodeURIComponent(main_body) + encodeURIComponent('HaveYourSay' + '\n\n') + encodeURIComponent(url);

                string = 'mailto:?' +
                              'subject=' + subject +
                              '&' +
                              'body=' + body;

                return string;
            }
        },
        filters: {
            datestamp: function (date) {
                return moment(date).format('D MMMM YYYY');
            },
            timestamp: function (date) {
                return moment(date).format('D MMM YYYY, h:mm:ss a');
            },
            daystamp: function (date) {
                return moment(date).format('ddd, D MMM');
            },
        },
        methods: {
            click_like: function (c) {
                app.click_like(c);
            },
            is_closed: function (c) {
                if (c.whatwedid_on === null) {
                    return false;
                }

                return moment().diff(moment(c.whatwedid_on), 'days') > 7;
            },
            update_comment: function () {
                if (this.newcomment.trim() === '') {
                    $('.popup .commentcard textarea').removeClass('highlight');
                    $('.popup .commentcard textarea').addClass('highlight');
                    $('.popup .commentcard textarea').focus();
                    return false;
                }

                ds.add_comment(this.card.id, this.newcomment.trim());
                card.comments.unshift({'createdon': moment().format("D MMM YYYY h:mma"), 'description': this.newcomment.trim() });

                this.newcomment = '';
                $('.popup .commentcard textarea').focus();

                return false;
            },
            update: function () {
                $('.popup .card2').removeClass('editcard');
                $('.popup .card2').addClass('displaycard');

                ds.update_card_response(this.card.id,
                                        this.card.lookingintoit,
                                        this.card.whatwedid,
                                        this.whatwedid_pre !== card.whatwedid);
                if (this.whatwedid_pre !== this.card.whatwedid) {
                    this.card.whatwedid_on = moment().format('DD MMM YYYY');
                }

                window.location.hash = 'board';
            }
        },
    });

    $('body').addClass('show-popup');
    popup.find('.comments textarea').focus();
};

app.new_cards = {};
app.show_newcard = function () {
    var card, popup;

    card = $('.templates .newcard').clone();
    popup = $('.popup');
    popup.empty();
    popup.append(card);

    $('body').addClass('show-popup');

    app.vue_new_card = new Vue({
        el: '.popup',
        data: { question: '', why: '' },
        methods: {
            create: function () {
                console.log('Create');
                if (this.question.trim().length === 0) {
                    card.find('.question textarea').removeClass('highlight');
                    card.find('.question textarea').addClass('highlight');
                    card.find('.question textarea').focus();
                    return false;
                }

                ds.create_card(this.question,
                               this.why,
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
            }
        }
    });

    card.find('.question textarea').focus();
};

app.show_board = function () {
    $('body').addClass('showboard');
};

app.click_like = function (c) {
    if (c.liked_in_session === false) {
        c.likes += 1;
        c.liked_in_session = true;
    } else {
        c.likes -= 1;
        c.liked_in_session = false;
    }
    ds.update_card_likes(c.id, c.likes);
    return false;
};

app.question_summary = function (c) {
    var qs, idx;
    qs = c.question;
    idx = qs.indexOf("\n");
    if (idx > -1 && idx < 80) {
        qs = qs.substring(0, idx);
    }
    if (qs > 80) {
        qs = c.question.substring(0, 78);
        qs += "&#8230;";
    }

    return qs;
};

app.initialise_card = function (card) {
    app.card_idx[card.id] = card;
    card.liked_in_session = false;

    card.lookingintoit = decodeURIComponent(card.lookingintoit);
    card.whatwedid = decodeURIComponent(card.whatwedid);

    card.likes = Number(card.likes);

    card.searchcriteria = function () {
        return card.question.toUpperCase();
    };
};

app.card_update_idx = function (c) {
    var last_updated = moment(c.updated_on).format('YYYYMMDDThhmm');

    c.comments.forEach(function (el) {
        var u = moment(el.createdon).format('YYYYMMDDThhmm');
        if (u > last_updated) {
            last_updated = u;
        }
    });

    return last_updated;
};

app.is_card_state_done = function (card) {
    return (card.whatwedid !== "");
};

app.sort_cards = function (cards) {
    return cards.sort(function (a, b) {
        if (app.card_update_idx(a) < app.card_update_idx(b)) {
            return 1;
        }
        if (app.card_update_idx(a) > app.card_update_idx(b)) {
            return -1;
        }

        return 0;
    });
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
                return app.sort_cards(this.cards);
            },
            display_cards: function () {
                return this.sorted_cards;
              /*
                var cutoff = moment().add(-40, 'days').format('YYYYMMDDThhmm');
                return this.sorted_cards.filter(function (el) {
                    return app.card_update_idx(el) > cutoff;
                });
              */
            },
            todo_list: function () {
                return this.display_cards.filter(function (c) {
                    return (c.whatwedid === "" && c.lookingintoit === "");
                });
            },
            doing_list: function () {
                return this.display_cards.filter(function (c) {
                    return (c.whatwedid === "" && c.lookingintoit !== "");
                });
            },
            done_list: function () {
                return this.display_cards.filter(function (c) {
                    return (c.whatwedid !== "");
                });
            },
            search_list: function () {
                var criteria = this.searchcriteria.toUpperCase();
                if (criteria.trim() === '') {
                    return [];
                }
                return this.sorted_cards.filter(function (c) {
                    return c.searchcriteria().indexOf(criteria) > -1;
                });
            },
            show_search_list: function () {
                return this.searchcriteria.toUpperCase() !== '';
            }
        },
        watch: {
            searchcriteria: function (val) {
                if (val.trim() === '') {
                    window.location.hash = 'board';
                } else {
                    window.location.hash = 'search';
                }
            },
        },
        methods: {
            show_slt_member: function () {
                window.location.hash = 'schedule-' + this.slt_member.id;
            },
            show_share_button: function () {
                return true;
            },
            click_like: function (c) {
                app.click_like(c);
            }
        },
        filters: {
            question_summary: function (c) {
                return app.question_summary(c);
            },
            newness_stamp: function (val) {
                var days, hours;
                hours = moment().diff(moment(val), 'hours');
                if (hours === 0) {
                    return 'Just now. ';
                }
                if (hours === 1) {
                    return '1 hour ago. ';
                }
                if (hours < 20) {
                    return hours + ' hours ago. ';
                }

                days = moment().diff(moment(val), 'days');
                if (days === 1) {
                    return '1 day ago. ';
                }
                if (days < 14) {
                    return days + ' days ago. ';
                }

                return '';
            }
        }
    });

    $('.createcard').on('click', function () {
        window.location.hash = '#newcard';
    });

    $('body').on('click', function (e) {
//        console.log('Click', e.target, $(e.target).parents('.popup').length );
        if ($('body').hasClass('show-popup') && $(e.target).parents('.popup').length === 0) {
            window.location.hash = '#board';
        }
    });

    if (app.location_hash_on_entry !== undefined) {
        window.location.hash = app.location_hash_on_entry;
        delete app.location_hash_on_entry;
    }

};

app.show_search = function () {
    $('body').addClass('showsearch');
};

app.show_schedule = function (id) {
    $('body').addClass('show-popup');
    $('body').addClass('showschedule');

    var schedule = $('.templates .schedule').clone();

    $('.popup').empty();
    $('.popup').append(schedule);
    $('.popup').removeClass('hide');

    vue_card = new Vue({
        el: '.popup .schedule',
        data: { 'sltlist': app.slt },
        filters: {
            daterange: function (slt) {
                return moment(slt.startdate).format('MMM Do') + ' - ' + moment(slt.enddate).format('MMM Do');
            }
        },
        computed: {
            slt_list: function () {
                return app.slt.filter(function (el) {
                    return el.startdate !== null;
                });
            },
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

app.show_login = function () {
    var login;

    login = $('.templates .login').clone();
    $('.popup').empty();
    $('.popup').append(login);

    app.vue_login = new Vue({
        el: '.popup .login',
        data: {
            username: 'admin',
            password: '',
            note: ' '
        },
        methods: {
            login: function () {
                app.check_password(this.username, this.password, function (successful) {
                    console.log('app.show_login.1 ', successful);
                    if (successful === true) {
                        $('body').addClass('admin');
                        window.location.hash = 'board';
                    } else {
                        app.vue_login.note = 'Username / Password combination not recognised';
                    }
                });
                return false;
            }
        }
    });

    $('body').addClass('show-popup');
    $('body').addClass('showlogin');
    login.find('.password').focus();
};

app.show_view = function (hash) {
    var routes, hashParts, viewFn;

    $('body').removeClass('show-popup');
    $('body').removeClass('showboard');
    $('body').removeClass('showschedule');
    $('body').removeClass('showlogin');
    $('body').removeClass('showsearch');

    if (hash === "") {
        window.location.hash = "#board";
        return;
    }

    routes = {
    };

    hashParts = hash.split('-');
    hashParts[1] = hashParts.slice(1).join('-');
    viewFn = routes[hashParts[0]];
    console.log("viewFn: ", hashParts[0], hashParts[1]);
    if (viewFn) {
        $('.popup').addClass('hide');
        $('.view-container').empty().append(viewFn(hashParts[1]));
    } else {
        viewFn = app['show_' + hashParts[0].slice(1)];
        if (viewFn) {
            console.log('app.show_view.viewFn.2 ');
            viewFn(hashParts[1]);
        }
    }

    $(window).scrollTop(0);
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

    if (window.location.hash !== '') {
        app.location_hash_on_entry = window.location.hash;
    }
    window.location.hash = 'board';

    $('.logout').on('click', function () {
        console.log('logout.1');
        $.cookie("session_key", null);
        $.post('/session/close', {}, function (data) {
            console.log('/session/close.1 ', data);
        });
        $('body').removeClass('admin');
    });

    app.show_view(window.location.hash);
};

/* jshint ignore:end */
$(document).keyup(function (e) {
    if (e.keyCode === 27) { // escape key maps to keycode `27`
        window.location.hash = 'board';
    }
});
