/**
 * Test for the IO class
 */
Aria.classDefinition({
    $classpath : 'test.aria.core.IOXDRTest',
    $extends : 'aria.jsunit.TestCase',
    $dependencies : ["aria.utils.Object"],
    $constructor : function () {
        this.$TestCase.constructor.call(this);
        this.urlRoot = Aria.rootFolderPath + 'test/';
    },
    $prototype : {
        /**
         * Specify that this test needs to be run on a visible document. This is required in IE because the flash plugin
         * (which is used in this test) is not initialized if the document inside which it is inserted is not visible.
         * @type Boolean
         */
        needVisibleDocument : true,

        setUp : function () {
            aria.core.IO.$on({
                '*' : this.checkEvent,
                'request' : this.onEvent,
                'response' : this.onEvent,
                scope : this
            });
            this.eventsState = 0;
        },
        tearDown : function () {

            aria.core.IO.$unregisterListeners(this);
            this.url = null;

            // Check that we didn't forget any timer on IO
            var timers = 0, id;
            for (id in aria.core.IO._poll) {
                if (aria.core.IO._poll.hasOwnProperty(id)) {
                    timers += 1;
                }
            }
            for (id in aria.core.IO._timeOut) {
                if (aria.core.IO._timeOut.hasOwnProperty(id)) {
                    timers += 1;
                }
            }

            this.assertEquals(timers, 0, "Undisposed timers on aria.core.IO");
        },
        onEvent : function (evt) {
            if (evt.req.url == this.url) {
                // we only catch events which come for the specified URL
                try {
                    if (evt.name == 'request') {
                        this.assertTrue(this.eventsState === 0);
                        this.eventsState = 1;
                    } else if (evt.name == 'response') {
                        this.assertTrue(this.eventsState == 1);
                        this.eventsState = 2;
                    }
                } catch (ex) {}
            }
        },

        /**
         * Asynchronous XDR test - to test timeout simply reduce the timeout parameter and trigger the failure handler:
         * timeout : 100 - to test xdr increase the timeout and trigger the success handler: timeout : 60000
         */
        testAsyncXdr : function () {
            var oScope = this;
            // Event handler for the success event
            this.handleSuccess = function (o) {
                try {
                    oScope.assertTrue(o.responseText !== null);

                    // There shouln't be pending requests
                    var pending = aria.utils.Object.keys(aria.core.IO.pendingRequests);
                    oScope.assertTrue(pending.length === 0, "Pending requests inside aria.core.IO");
                } catch (ex) {}
                oScope.notifyTestEnd("testAsyncXdr", true);
            };

            // Event handler for the failure event
            this.handleFailure = function (o) {
                try {
                    oScope.assertFalse(o === 'undefined');
                } catch (ex) {}
                oScope.notifyTestEnd("testAsyncXdr", true);
            };

            // Set up the callback object used for the transaction.
            this.callback = {
                fn : this.handleSuccess,
                scope : this,
                onerror : this.handleFailure,
                onerrorScope : this,
                timeout : 100
            };

            // Make request
            aria.core.IO.asyncRequest({
                method : 'GET',
                url : "http://pipes.yahooapis.com/pipes/pipe.run?_id=giWz8Vc33BG6rQEQo_NLYQ&_render=json",
                callback : this.callback
            });

            try {
                this.assertLogsEmpty();
            } catch (ex) {
                this.notifyTestEnd("testAsyncXdr");
            }
        },

        /**
         * Asynchronous failing XDR test
         */
        testAsyncFailingXdr : function () {
            // Make request
            aria.core.IO.asyncRequest({
                // this request should fail as there is no crossdomain.xml file in http://www.google.com/
                method : 'GET',
                url : "http://www.google.com/",
                callback : {
                    fn : this._failingXdrHandleSuccess,
                    scope : this,
                    onerror : this._failingXdrHandleFailure,
                    onerrorScope : this
                }
            });

            try {
                this.assertLogsEmpty();
            } catch (ex) {
                this.notifyTestEnd("testAsyncFailingXdr");
            }
        },

        // Event handler for the success event
        _failingXdrHandleSuccess : function (o) {
            try {
                this.fail("This request should not succeed");
            } catch (ex) {}
            this.notifyTestEnd("testAsyncFailingXdr");
        },

        // Event handler for the success event
        _failingXdrHandleFailure : function (o) {
            this.notifyTestEnd("testAsyncFailingXdr");
        }
    }
});