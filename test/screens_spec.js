/*jslint browser: true*/
/*jslint nomen: true */
/*jslint node: true */

/*global $, _, jQuery, alert, console, moment, app */
/*global describe, expect, beforeEach, it */

"use strict";

describe("Show Screens", function () {

    it("Should show a simple screen", function () {
        app.show_schedule();

        expect(true).toBe(true);
    });
/*
    it("Should show a simple screen which responds to data", function () {
        app.show_card(183, function () {
            expect(app.vue.id).toEqual(183);
        });

    });
*/

/*
    it("Should generate list of 76 objects", function () {
        var obj = app.generate_plan();

        expect(app.psc.date).toEqual('15 Jul 2017');
        expect(app.bd.date).toEqual('28 Sep 2017');

        expect(obj.list.length).toEqual(76);
    });
*/
});
