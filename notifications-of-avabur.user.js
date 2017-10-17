// ==UserScript==
// @name           Notifications of Avabur
// @namespace      https://github.com/davidmcclelland/
// @author         Dave McClelland <davidmcclelland@gmail.com>
// @homepage       https://github.com/davidmcclelland/notifications-of-avabur
// @supportURL     https://github.com/davidmcclelland/notifications-of-avabur/issues
// @description    Never miss another gauntlet again!
// @include        https://avabur.com/game.php
// @include        http://avabur.com/game.php
// @include        https://www.avabur.com/game.php
// @include        http://www.avabur.com/game.php
// @include        https://beta.avabur.com/game
// @include        http://beta.avabur.com/game
// @include        https://www.beta.avabur.com/game
// @include        http://www.beta.avabur.com/game
// @version        0.2.1
// @icon           https://rawgit.com/davidmcclelland/notifications-of-avabur/master/res/img/logo-32.png
// @run-at         document-end
// @connect        githubusercontent.com
// @connect        github.com
// @connect        self
// @grant          None
// @require        https://rawgit.com/davidmcclelland/notifications-of-avabur/master/lib/toastmessage/javascript/jquery.toastmessage.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/buzz/1.2.0/buzz.min.js
// @require        https://openuserjs.org/src/libs/sizzle/GM_config.js
// @license        LGPL-2.1
// @noframes
// ==/UserScript==


const Toast = { //Tampermonkey's scoping won't let this constant be globally visible
    error: function(msg) {
        console.error(msg);
        $().toastmessage('showErrorToast', msg);
    },
    notice: function(msg) {
        $().toastmessage('showNoticeToast', msg);
    },
    success: function(msg) {
        $().toastmessage('showSuccessToast', msg);
    },
    warn: function(msg) {
        console.warn(msg);
        $().toastmessage('showWarningToast', msg);
    },
    incompatibility: function(what) {
        $().toastmessage('showToast', {
            text: "Your browser does not support " + what +
                ". Please <a href='https://www.google.co.uk/chrome/browser/desktop/' target='_blank'>" +
                "Download the latest version of Google Chrome</a>",
            sticky: true,
            position: 'top-center',
            type: 'error'
        });
    }
};

//Check if the user can even support the bot
if (typeof(MutationObserver) === "undefined") {
    log.error("Cannot support mutation observer!");
} else {
    (function($, MutationObserver, buzz) {
        'use strict';

        /**
         * Creates a GitHub CDN URL
         * @param {String} path Path to the file without leading slashes
         * @param {String} [author] The author. Defaults to davidmcclelland
         * @param {String} [repo] The repository. Defaults to notifications-of-avabur
         * @returns {String} The URL
         */
        const gh_url = function(path, author, repo) {
            author = author || "davidmcclelland";
            repo = repo || "notifications-of-avabur";

            // return "https://cdn.rawgit.com/" + author + "/" + repo + "/" +
            //     GM_info.script.version + "/" + path;
            return "https://rawgit.com/" + author + "/" + repo + "/" +
                'master' + "/" + path;
        };

        const URLS = {
            sfx: {
                message_ding: gh_url("res/sfx/message_ding.wav")
            },
            css: {
                toast: gh_url("lib/toastmessage/resources/css/jquery.toastmessage.css"),
                settings: gh_url("res/css/settings.css")
            },
            img: {
                icon: gh_url("res/img/logo-32.png")
            }
        };

        /////////////////////////////////////////////////////
        // This is the script code. Don't change it unless //
        // you know what you're doing ;)                   //
        /////////////////////////////////////////////////////

        var NOA_SETTINGS = {
            id: 'NoAConfig',
            title: 'NoA Settings',
            fields: {
                fatiguePopup: {
                    label: 'Fatigue popup',
                    type: 'checkbox',
                    default: true
                },
                eventPopup: {
                    label: 'Event popup',
                    type: 'checkbox',
                    default: true
                },
                harvestronPopup: {
                    label: 'Harvestron popup',
                    type: 'checkbox',
                    default: true
                },
                constructionPopup: {
                    label: 'Construction popup',
                    type: 'checkbox',
                    default: true
                },
                whisperPopup: {
                    label: 'Whisper popup',
                    type: 'checkbox',
                    default: true
                },
                questCompletePopup: {
                    label: 'Quest complete popup',
                    type: 'checkbox',
                    default: true
                },
                chatSearchPopup: {
                    label: 'Chat search popup',
                    type: 'checkbox',
                    default: true
                },
                lootSearchPopup: {
                    label: 'Loot search popup',
                    type: 'checkbox',
                    default: true
                },
                craftingSearchPopup: {
                    label: 'Crafting search popup',
                    type: 'checkbox',
                    default: true
                },
                fatigueSound: {
                    label: 'Fatigue sound',
                    type: 'checkbox',
                    default: true
                },
                eventSound: {
                    label: 'Event sound',
                    type: 'checkbox',
                    default: true
                },
                harvestronSound: {
                    label: 'Harvestron sound',
                    type: 'checkbox',
                    default: true
                },
                constructionSound: {
                    label: 'Construction sound',
                    type: 'checkbox',
                    default: true
                },
                whisperSound: {
                    label: 'Whisper sound',
                    type: 'checkbox',
                    default: true
                },
                questCompleteSound: {
                    label: 'Quest complete sound',
                    type: 'checkbox',
                    default: true
                },
                chatSearchSound: {
                    label: 'Chat search sound',
                    type: 'checkbox',
                    default: true
                },
                lootSearchSound: {
                    label: 'Loot search sound',
                    type: 'checkbox',
                    default: true
                },
                craftingSearchSound: {
                    label: 'Crafting search sound',
                    type: 'checkbox',
                    default: true
                },
                chatSearchValues: {
                    label: 'Chat search values',
                    type: 'textarea',
                    default: ''
                },
                lootSearchValues: {
                    label: 'Loot search values',
                    type: 'textarea',
                    default: ''
                },
                craftingSearchValues: {
                    label: 'Crafting search values',
                    type: 'textarea',
                    default: ''
                }
            },
        };

        const SFX = {
            circ_saw: new buzz.sound(URLS.sfx.circ_saw),
            msg_ding: new buzz.sound(URLS.sfx.message_ding)
        };

        /** Misc function container */
        const fn = {
            /**
             * Creates a floaty notification
             * @param {String} text Text to display
             */
            notification: function(text) {
                Notification.requestPermission().then(function() {
                    var n = new Notification(GM_info.script.name,  {
                        icon: URLS.img.icon, 
                        body: text 
                    });
                    setTimeout(n.close.bind(n), 5000);
                    n.addEventListener('click', function(e) {
                        window.focus();
                        e.target.close();
                    }, false);
                });
            },
            checkRecordsVisible: function(records) {
                for (var i = 0; i < records.length; i++) {
                    const target = $(records[i].target);
                    var style = window.getComputedStyle(target.context);
                    if (style.display !== 'none') {
                        return true;
                    }
                }
                return false;
            },
            findSearchValues: function(records, searchValuesKey) {
                for (var i = 0; i < records.length; i++) {
                    const addedNodes = records[i].addedNodes;
                    if (addedNodes.length) {
                        for (var j = 0; j < addedNodes.length; j++) {
                            const text = $(addedNodes[j]).text();
                            // Look for any values listed under the given key
                            var searchValues = GM_config.get(searchValuesKey).split(/\r?\n/);
                            for (var k = 0; k < searchValues.length; k++) {
                                if (searchValues[k].length && text.match(new RegExp(searchValues[k], 'i'))) {
                                    return text;
                                }
                            }
                        }
                    }
                }
                return false;
            }
        };

        /** Collection of mutation observers the script uses */
        const OBSERVERS = {
            chat_search: new MutationObserver(
                /** @param {MutationRecord[]} records */
                function(records) {
                    var text = fn.findSearchValues(records, 'chatSearchValues');
                    if (text) {
                        if (GM_config.get('chatSearchPopup')) {
                            fn.notification(text);
                        }
                        if (GM_config.get('chatSearchSound')) {
                            SFX.msg_ding.play();
                        }
                        return;
                    }

                    for (var i = 0; i < records.length; i++) {
                        const addedNodes = records[i].addedNodes;
                        if (addedNodes.length) {
                            for (var j = 0; j < addedNodes.length; j++) {
                                const text = $(addedNodes[j]).text();
                                if (text.match(/^\[[0-9]+:[0-9]+:[0-9]+]\s*Whisper from/)) {
                                    if (GM_config.get('whisperPopup')) {
                                        fn.notification(text);
                                    }
                                    if (GM_config.get('whisperSound')) {
                                        SFX.msg_ding.play();
                                    }
                                }
                            }
                        }
                    }
                }
            ),
            loot_search: new MutationObserver(
                /** @param {MutationRecord[]} records */
                function(records) {
                    var text = fn.findSearchValues(records, 'lootSearchValues');
                    if (text) {
                        if (GM_config.get('lootSearchPopup')) {
                            fn.notification(text);
                        }
                        if (GM_config.get('lootSearchSound')) {
                            SFX.msg_ding.play();
                        }
                        return;
                    }
                }
            ),
            crafting_search: new MutationObserver(
                /** @param {MutationRecord[]} records */
                function(records) {
                    var text = fn.findSearchValues(records, 'craftingSearchValues');
                    if (text) {
                        if (GM_config.get('craftingSearchPopup')) {
                            fn.notification(text);
                        }
                        if (GM_config.get('craftingSearchSound')) {
                            SFX.msg_ding.play();
                        }
                        return;
                    }
                }
            ),
            fatigue: new MutationObserver(
                function(records) {
                    for (var i = 0; i < records.length; i++) {
                        const addedNodes = records[i].addedNodes;
                        if (addedNodes.length) {
                            for (var j = 0; j < addedNodes.length; j++) {
                                const text = $(addedNodes[j]).text();
                                if (text === '0') {
                                    if (GM_config.get('fatiguePopup')) {
                                        fn.notification('You are fatigued!');
                                    }
                                    if (GM_config.get('fatigueSound')) {
                                        SFX.msg_ding.play();
                                    }
                                }
                            }
                        }
                    }
                }
            ),
            harvestron: new MutationObserver(
                function(records) {
                    if (fn.checkRecordsVisible(records)) {
                        if (GM_config.get('harvestronPopup')) {
                            fn.notification("Harvestron available!");
                        }
                        if (GM_config.get('harvestronSound')) {
                            SFX.msg_ding.play();
                        }
                    }
                }
            ),
            construction: new MutationObserver(
                function(records) {
                    if (fn.checkRecordsVisible(records)) {
                        if (GM_config.get('constructionPopup')) {
                            fn.notification("Construction available!");
                        }
                        if (GM_config.get('constructionSound')) {
                            SFX.msg_ding.play();
                        }
                    }
                }
            ),
            event: new MutationObserver(
                function(records) {
                    for (var i = 0; i < records.length; i++) {
                        const addedNodes = records[i].addedNodes;
                        if (addedNodes.length) {
                            for (var j = 0; j < addedNodes.length; j++) {
                                const text = $(addedNodes[j]).text();
                                if (text === '04m55s') {
                                    if (GM_config.get('eventPopup')) {
                                        fn.notification('An event is starting in five minutes!');
                                    }
                                    if (GM_config.get('eventSound')) {
                                        SFX.msg_ding.play();
                                    }
                                } else if (text === '30s') {
                                    if (GM_config.get('eventPopup')) {
                                        fn.notification('An event is starting in thirty seconds!');
                                    }
                                    if (GM_config.get('eventSound')) {
                                        SFX.msg_ding.play();
                                    }
                                } else if (text === '01s') {
                                    if (GM_config.get('eventPopup')) {
                                        fn.notification('An event is starting!');
                                    }
                                    if (GM_config.get('eventSound')) {
                                        SFX.msg_ding.play();
                                    }
                                }
                            }
                        }
                    }
                }
            ),
            questComplete: new MutationObserver(
                function(records) {
                    for (var i = 0; i < records.length; i++) {
                        const addedNodes = records[i].addedNodes;
                        if (addedNodes.length) {
                            for (var j = 0; j < addedNodes.length; j++) {
                                const text = $(addedNodes[j]).text();
                                if (text.startsWith('You have completed your quest!')) {
                                    if (GM_config.get('questCompletePopup')) {
                                        fn.notification('Quest complete!');
                                    }
                                    if (GM_config.get('questCompleteSound')) {
                                        SFX.msg_ding.play();
                                    }
                                }
                            }
                        }
                    }
                }
            ),
            bossFailure: new MutationObserver(
                function(records) {
                    if (fn.checkRecordsVisible(records)) {
                        if (GM_config.get('eventPopup')) {
                            fn.notification('You were eliminated from the gauntlet!');
                        }
                        if (GM_config.get('eventSound')) {
                            SFX.msg_ding.play();
                        }
                    }
                }
            ),

        };

        (function() {
            const ON_LOAD = {
                "Initializing settings": function() {
                    $.when($.get(URLS.css.settings)).done(function(response) {
                        NOA_SETTINGS.css = response;
                        GM_config.init(NOA_SETTINGS);
                    });
                },
                "Loading script CSS": function() {
                    const $head = $("head"),
                        keys = Object.keys(URLS.css);

                    for (var i = 0; i < keys.length; i++) {
                        $head.append("<link type='text/css' rel='stylesheet' href='" + URLS.css[keys[i]] + "'/>");
                    }
                },
                "Starting chat monitor": function() {
                    OBSERVERS.chat_search.observe(document.querySelector("#chatMessageList"), {
                        childList: true
                    });
                },
                "Starting loot monitor": function() {
                    OBSERVERS.loot_search.observe(document.querySelector("#latestLoot"), {
                        childList: true
                    });
                },
                "Starting crafting monitor": function() {
                    OBSERVERS.crafting_search.observe(document.querySelector('#craftingGainWrapper'), {
                        childList: true,
                        subtree: true
                    });
                },
                "Starting fatigue monitor": function() {
                    const autosRemainingSpans = document.getElementsByClassName('autosRemaining');

                    /* There is one of these spans in each of the main wrappers (battle, tradeskill, crafting, carving).
                    It seems like all of them are currently updated with the same "autosRemaining" value each action,
                    so there's no need to watch all of them. */
                    if (autosRemainingSpans && autosRemainingSpans.length) {
                        OBSERVERS.fatigue.observe(autosRemainingSpans[0], {
                            childList: true
                        });
                    }
                },
                "Starting harvestron monitor": function() {
                    OBSERVERS.harvestron.observe(document.querySelector("#harvestronNotifier"), { attributes: true });
                },
                "Starting construction monitor": function() {
                    OBSERVERS.construction.observe(document.querySelector("#constructionNotifier"), { attributes: true });
                },
                "Starting event monitor": function() {
                    OBSERVERS.event.observe(document.querySelector("#eventCountdown"), { childList: true });
                },
                "Starting quest monitor": function() {
                    // Observe battle quests
                    OBSERVERS.questComplete.observe(document.querySelector("#bq_info"), { childList: true });

                    // Observe tradeskill quests
                    OBSERVERS.questComplete.observe(document.querySelector("#tq_info"), { childList: true });

                    // Observe profession quests
                    OBSERVERS.questComplete.observe(document.querySelector("#pq_info"), { childList: true });
                },
                "Starting boss failure monitor": function() {
                    const bossFailureNotifications = document.getElementsByClassName('boss_failure_notification');

                    // There should be only one of these
                    if (bossFailureNotifications && bossFailureNotifications.length) {
                        OBSERVERS.bossFailure.observe(bossFailureNotifications[0], { attributes: true });
                    }
                },
                "Adding settings button": function() {
                    var settingsWrapper = $('#settingsLinksWrapper');
                    settingsWrapper.append('<a id="noaPreferences"><button class="btn btn-primary">NoA Settings</button></a>');
                    $('#noaPreferences').click(function() {
                        GM_config.open();
                    });
                }
            };

            const keys = Object.keys(ON_LOAD);
            for (var i = 0; i < keys.length; i++) {
                console.log('[' + GM_info.script.name + '] ' + keys[i]);
                ON_LOAD[keys[i]]();
            }
        })();

    })(jQuery, MutationObserver, buzz);
}