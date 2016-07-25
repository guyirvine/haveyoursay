/*jslint browser: true*/
/*jslint nomen: true */
/*jslint node: true */

/*global $, _, jQuery, alert, console, moment, UUIDjs, c3, d3 */

"use strict";

var app = {};

app.cards = [
    {
        'id': 1,
        'color': 'blue',
        'question': 'First Title',
        'why': 'Why 1',
        'lookingintoit': '',
        'whatwedid': '',
        'likes': 1,
        'comments': [
            {
                'text': 'Second Comment sdjhasdfs fsd fgsdf gsf hsf hg rsts ethftx hdz gsf hdr tdz hcf hdzr gsfth sdg dxr gfzdf gdzf gd ',
                'createdon': '14 Jul 2016 10:35am'
            },
            {
                'text': 'First Comment',
                'createdon': '14 Jul 2016 10:30am'
            }
        ]
    },
    {
        'id': 2,
        'color': 'blue',
        'question': 'Second Title',
        'why': 'Why 2',
        'lookingintoit': 'lookingintoit 2',
        'whatwedid': '',
        'likes': 1,
        'comments': [
        ]
    },
    {
        'id': 3,
        'color': 'green',
        'question': 'Third Title',
        'why': 'Why 3',
        'lookingintoit': 'lookingintoit 3',
        'whatwedid': 'whatwedid 3',
        'likes': 0,
        'comments': [
        ]
    },
    {
        'id': 4,
        'color': 'blue',
        'question': 'Fourth Title',
        'why': 'Why 4',
        'lookingintoit': 'lookingintoit 4',
        'whatwedid': 'whatwedid 4',
        'likes': 5,
        'comments': [
        ]
    }
];




app.show_view = function (hash) {
    var routes, hashParts, viewFn;

    if (hash === "") {
        window.location.hash = "#board";
        return;
    }

    routes = {
        '#search': app.search_view,
        '#card': app.card_view,
        '#board': app.board_view,
        '#schedule': app.schedule_view
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

    $('.searchcriteria').keyup(function () {
        app.search();
    });

    app.board_view();
    app.show_view(window.location.hash);
};

app.card_view = function (id) {
    if (id === 'new') {
        app.new_card();
        return;
    }

    var card, popup, _c, comments, comment;

    _c = $('#card-' + id);
    card = $('.templates .card').clone();

    _.each(['blue', 'green'], function (color) {
        if (_c.hasClass(color)) {
            card.addClass(color);
        }
    });

    //----------------------------------
    card.find('.question .input').text(_c.find('.question').text());
    card.find('.question textarea').text(_c.find('.question').text());
    card.find('.why .input').text(_c.find('.why').text());
    card.find('.why textarea').text(_c.find('.why').text());
    card.find('.lookingintoit .input').text(_c.find('.lookingintoit').text());
    card.find('.whatwedid .input').text(_c.find('.whatwedid').text());

    //----------------------------------
    comments = card.find('.comments');
    comment = comments.find('.comment').remove();
    _.each(_c.find('.comments .comment'), function (c) {
        var _comment = comment.clone();
        _comment.find('.createdon').text($(c).find('.createdon').text());
        _comment.find('.input').text($(c).find('.input').text());
        comments.append(_comment);
    });

    //----------------------------------
    if (app.new_cards['card-' + id] === 1) {
        card.addClass('newcard');
    }

    //----------------------------------
    card.find('.newcomment').on('click', function () {
        card.find('.comments textarea').val('');
        card.removeClass('displaycard');
        card.addClass('newcomment');
        card.find('.comments textarea').focus();
        return false;
    });

    //----------------------------------
    card.find('.updatecomment').on('click', function () {
        if (card.find('.comments textarea').val().trim() === '') {
            card.find('.comments').removeClass('newcomment');
            return false;
        }

        var _comment, list, new_com;

        _comment = comment.clone();
        _comment.find('.createdon').text(moment().format("D MMM YYYY h:mma"));
        _comment.find('.input').text(card.find('.comments textarea').val());

        list = comments.find('.comment');
        if (list.length === 0) {
            comments.append(_comment);
        } else {
            comments.find('.comment').first().before(_comment);
        }

        new_com = $('.templates .boardcard .comment').clone();
        new_com.find('.createdon').text(moment().format("D MMM YYYY h:mma"));
        new_com.find('.input').text(card.find('.comments textarea').val());
        list = _c.find('.comments .comment');
        if (list.length === 0) {
            _c.find('.comments').append(new_com);
        } else {
            _c.find('.comments .comment').first().before(new_com);
        }

        var status = app.format_status_label(Number(_c.find('.status .count').text()), _c.find('.comments .comment').length);
        _c.find('.status .label').text(status);

        card.removeClass('newcomment');
        card.addClass('displaycard');

        return false;
    });

    card.find('.action a.edit').on('click', function () {
        card.find('.question textarea').val(card.find('.question .input').text());
        card.find('.why textarea').val(card.find('.why .input').text());
        card.find('.lookingintoit textarea').val(card.find('.lookingintoit .input').text());
        card.find('.whatwedid textarea').val(card.find('.whatwedid .input').text());

        _.each(card.find('.comments .comment'), function (_c) {
            var c = $(_c);
            c.find('textarea').val(c.find('.input').text());
        });

        card.removeClass('displaycard');
        card.addClass('editcard');
        card.find('.question textarea').focus();
        return false;
    });

    card.find('.action a.cancel').on('click', function () {
        window.location.hash = 'board';
        return false;
    });

    card.find('.action a.cancelcomment').on('click', function () {
        window.location.hash = 'board';
        return false;
    });

    card.find('.action a.update').on('click', function () {
        var question, question_summary, idx;

        question = card.find('.question textarea').val();
        if (question.trim().length === 0) {
            return false;
        }

        question_summary = question;
        idx = question_summary.indexOf("\n");
        if (idx > -1 && idx < 80) {
            question_summary = question_summary.substring(0, idx);
        }
        if (question_summary > 80) {
            question_summary = question.substring(0, 78);
            question_summary += "&#8230;";
        }
        _c.find('.question').text(card.find('.question textarea').val());
        _c.find('.question_summary').html(question_summary);
        _c.find('.why').text(card.find('.why textarea').val());
        _c.find('.lookingintoit').text(card.find('.lookingintoit textarea').val());
        _c.find('.whatwedid').text(card.find('.whatwedid textarea').val());

        app.position_card_on_board(_c);

        window.location.hash = 'board';
        return false;
    });

    popup = $('.container .popup');

    popup.removeClass('hide');
    popup.empty();
    popup.append(card);
};

app.new_cards = {};
app.new_card = function () {
    var card, popup, color;

    card = $('.templates .card').clone();

    color = 'blue';
    card.addClass(color);
    card.removeClass('displaycard');
    card.addClass('newcard');

    card.find('.action a.cancel').on('click', function () {
        window.location.hash = 'board';
        return false;
    });
    card.find('.action a.update').on('click', function () {
        if (card.find('.question textarea').val().trim().length === 0) {
            return false;
        }

        var new_id = app.generate_uuid();
        app.new_cards['card-' + new_id] = 1;

        app.add_card_to_board($('.templates .boardcard'),
                              new_id,
                              card.find('.question textarea').val(),
                              color,
                              card.find('.why textarea').val(),
                              '', // lookingintoit
                              '', // What we did
                              [], //comments
                              0 //likes
                              );

        window.location.hash = 'board';
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

app.likes = {};


app.add_card_to_board = function (_card,
                                  id, question, color,
                                  why, lookingintoit, whatwedid,
                                  comments, likes) {
    var card, question_summary, comments_obj, _comment, idx;

    card = _card.clone();
    card.attr('id', 'card-' + id);
    question_summary = question;
    idx = question_summary.indexOf("\n");
    if (idx > -1 && idx < 80) {
        question_summary = question_summary.substring(0, idx);
    }
    if (question_summary > 80) {
        question_summary = question.substring(0, 78);
        question_summary += "&#8230;";
    }

    card.addClass(color);
    card.find('.question_summary').text(question_summary);
    card.find('.question').text(question);
    card.find('.why').text(why);
    card.find('.lookingintoit').text(lookingintoit);
    card.find('.whatwedid').text(whatwedid);

    comments_obj = card.find('.comments');
    _comment = comments_obj.find('.comment').remove();
    _.each(comments, function (c) {
        var comment = _comment.clone();
        comment.find('.createdon').text(c.createdon);
        comment.find('.input').text(c.text);
        comments_obj.append(comment);
    });

    card.find('.status .count').text(likes);
    card.find('.status a span').text('like');
    card.find('.status .label').text(app.format_status_label(likes, comments.length));
    card.find('.status a').on('click', function () {
        var likes_count = Number(card.find('.status .count').text());
        if (app.likes['card-' + id] === undefined) {
            likes_count += 1;
            app.likes['card-' + id] = 1;
            card.find('.status a span').text('unlike');
        } else {
            likes_count -= 1;
            delete app.likes['card-' + id];
            card.find('.status a span').text('like');
        }
        card.find('.status .count').text(likes_count);
        card.find('.status .label').text(app.format_status_label(likes_count, comments.length));
        return false;
    });
    card.find('.searchlookup').text(question.toUpperCase() + ' ' +
                                    why.toUpperCase() + ' ' +
                                    lookingintoit.toUpperCase() + ' ' +
                                    whatwedid.toUpperCase()
                                  );

    card.on('click', function () {
        window.location.hash = 'card-' + id;
    });

    card.addClass('displaycard');
    app.position_card_on_board(card);
};


app.load_board = function () {
    var _card;

    app.board = $('.templates .board').clone();
    _card = $('.templates .boardcard');
    _.each(app.cards, function (el) {
        app.add_card_to_board(_card,
                              el.id, el.question, el.color,
                              el.why, el.lookingintoit, el.whatwedid,
                              el.comments, el.likes);
    });

    $('.content').empty();
    $('.content').append(app.board);
};

app.format_status_label = function (like_count, comment_count) {
    var status = "";
    if (like_count === 0) {
        status += '';
    } else if (like_count === 1) {
        status += '1 like';
    } else {
        status += like_count + ' likes';
    }

    if (comment_count === 0) {
        status += '';
    } else if (comment_count === 1) {
        if (status !== '') {
            status += ', ';
        }
        status += '1 comment';
    } else {
        if (status !== '') {
            status += ', ';
        }
        status += comment_count + ' comments';
    }

    return status;
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

    if (app.search_running === true) {
        app.search_pending = true;
        return;
    }

    app.search_running = true;
    app.search_pending = false;

    criteria = $('.searchcriteria').val().toUpperCase();
    if (criteria.trim().length === 0) {
        window.location.hash = 'board';
        app.search_running = false;
        return;
    }
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

app.schedule_view = function () {
  var schedule, _li, list, ul;

  schedule = $('.templates .schedule').clone();
  _li = schedule.find('li').remove();

  list = [
    {
      'src': 'images/smiley_1.png',
      'start': '1 Jun 2016',
      'end': '14 Jun 2016'
    },
    {
      'src': 'images/smiley_2.png',
      'start': '15 Jun 2016',
      'end': '29 Jun 2016'
    },
    {
      'src': 'images/smiley_3.png',
      'start': '30 Jun 2016',
      'end': '12 Jul 2016'
    },
    {
      'src': 'images/smiley_4.png',
      'start': '12 Jul 2016',
      'end': '26 Jul 2016'
    }
  ];

  ul = schedule.find('ul');
  _.each(list, function(el) {
    var li, start, end, date_range;

    start = moment(el.start);
    end = moment(el.end);

    li = _li.clone();
    li.find('img')[0].src = el.src;
    date_range = start.format('MMM Do') + ' - ' + end.format('MMM Do');
    li.find('.date-range').text(date_range);

    ul.append(li);
  });

  $('.popup').empty();
  $('.popup').append(schedule);
  $('.popup').removeClass('hide');
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
