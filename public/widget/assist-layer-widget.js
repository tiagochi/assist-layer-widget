function AssistLayerWidget() {
    function addCss(cssId, href) {
        if (!document.getElementById(cssId)) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = href;
            link.media = 'all';
            head.appendChild(link);
        }
    }
    this.init = function (data) { //{app_id,identity_provider_url,botUserId}
        var oReq = new XMLHttpRequest();
        var identity_provider_url = data.identity_provider_url?data.identity_provider_url:'https://platform-dev.assi.st/platform-core/api/public/v1/layer';
        
        oReq.onload = function (e) {
            var xhr = e.target;
            var assistLayerWidgetDiv = document.getElementById('assist-layer-widget');
            assistLayerWidgetDiv.innerHTML = `
            <div id="layer-widget-button-wrapper" class="layer-widget-button-wrapper">
                <div id="layer-widget-button" class="layer-widget-button" onclick="assistLayerWidget.openWidget('`+ xhr.response.appId + `','` + identity_provider_url + `','` + data.chatBotCode + `','` + data.environmentType + `','` + xhr.response.chatBotUserId + `');">
                </div>
            </div>
            `
        };
        
        oReq.open('GET', identity_provider_url+'/config?environmentType='+data.environmentType+'&chatBotCode='+data.chatBotCode, true);
        oReq.responseType = 'json';
        oReq.send();
    }

    this.openWidget = function (appId,identity_provider_url,chatBotCode,environmentType,chatBotUserId) {
        this.closeWidget();
        
        document.getElementById('layer-widget-button-wrapper').style.display='none';
        
        var assistLayerWidgetDiv = document.getElementById('assist-layer-widget');
        assistLayerWidgetDiv.innerHTML += `
        <iframe id="layer-widget" class="layer-widget slideInUp animated" src="https://assist-layer-widget.herokuapp.com/conversations/?app_id=`+ appId + `&identity_provider_url=` + identity_provider_url + `&chatBotCode=` + chatBotCode + `&environmentType=` + environmentType + `&botUserId=` + chatBotUserId + `">
        </iframe>
        `
    }

    
    this.closeWidget = function () {
        document.getElementById('layer-widget-button-wrapper').style.display='block';
        var assistLayerWidgetIframe = document.getElementById('layer-widget');
        if (assistLayerWidgetIframe) {
            assistLayerWidgetIframe.parentNode.removeChild(assistLayerWidgetIframe);
        }
    }

    addCss('assist-layer-widget-css', 'https://assist-layer-widget.herokuapp.com/widget/assist-layer-widget.css');
    // addCss('assist-layer-widget-css', 'assist-layer-widget.css');
    addCss('animated', 'https://cdn.jsdelivr.net/npm/animate.css@3.5.2/animate.min.css');


};


window.addEventListener('message', function (event) {
    if (event.data === 'closeWidget') {
        assistLayerWidget.closeWidget();
    }
}); 