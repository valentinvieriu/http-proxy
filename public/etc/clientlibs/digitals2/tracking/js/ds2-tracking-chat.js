window.digitals2 = window.digitals2 || {};
window.digitals2.tracking = window.digitals2.tracking || {};

window.digitals2.tracking.chat = (function () {

    function getLoadChat() {
        var pageObj = window.digitals2.tracking.api.getPageObject(window.digitals2.tracking.api.getCurrentPageIndex());
        return pageObj.page.attributes.loadChat;
    }

    function setLoadChat(value) {
        var pageObj = window.digitals2.tracking.api.getPageObject(window.digitals2.tracking.api.getCurrentPageIndex());
        if (typeof value !== 'undefined' && pageObj && pageObj.page && pageObj.page.attributes) {
            pageObj.page.attributes.loadChat = value;
        } else if ( (typeof value === 'undefined' || value.length == 0) && pageObj && pageObj.page && pageObj.page.attributes) {
            pageObj.page.attributes.loadChat = true; // set true in case value is undefined or empty
        }
    }

    function getChatPosition() {
        var pageObj = window.digitals2.tracking.api.getPageObject(window.digitals2.tracking.api.getCurrentPageIndex());
        return pageObj.page.attributes.chatPosition;
    }

    function setChatPosition(value) {
        var pageObj = window.digitals2.tracking.api.getPageObject(window.digitals2.tracking.api.getCurrentPageIndex());
        if (typeof value !== 'undefined' && pageObj && pageObj.page && pageObj.page.attributes) {

            if (value.startsWith("top")) {
                value = "TOP";
            } else if (value.startsWith("bottom")) {
                value = "BOTTOM";
            }
            pageObj.page.attributes.chatPosition = value;
        }
    }

    return {
        getLoadChat: getLoadChat,
        setLoadChat: setLoadChat,
        getChatPosition: getChatPosition,
        setChatPosition: setChatPosition
    };
}());
