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
        oReq.onload = function (e) {
            var xhr = e.target;
            results.innerHTML = xhr.response.message;
            var assistLayerWidgetDiv = document.getElementById('assist-layer-widget');
            assistLayerWidgetDiv.innerHTML = `
            <div id="layer-widget-button" class="layer-widget-button" onclick="document.getElementById('layer-widget-button').style.display='none';document.getElementById('layer-widget').style.display='block';">
            </div>
            <iframe id="layer-widget" class="layer-widget slideInUp animated" src="https://assist-layer-widget.herokuapp.com/conversations/?app_id=`+ xhr.response.app_id + `&identity_provider_url=` + data.identity_provider_url + `&chatBotId=` + data.chatBotId + `&environmentType=` + data.environmentType + `&botUserId=` + xhr.response.chatbotUserId + `">
            </iframe>
            `
        };
        oReq.open('GET', data.identity_provider_url+'/config?environmentType='+data.environmentType+'&chatBotCode='+data.chatBotCode, true);
        oReq.responseType = 'json';
        oReq.send();

    }

    //addCss('assist-layer-widget','http://platform.assi.st/assets/css/assist-layer-widget.css');
    addCss('assist-layer-widget-css', 'https://assist-layer-widget.herokuapp.com/widget/assist-layer-widget.css');
    addCss('animated', 'https://cdn.jsdelivr.net/npm/animate.css@3.5.2/animate.min.css');


};

