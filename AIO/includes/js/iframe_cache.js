// iframe_cache.js
// Runs inside each cacheXXX.html iframe. Relays AppCache events to parent cache.html via postMessage.
(function () {
    var appCache = window.applicationCache;
    if (!appCache) {
        window.parent.postMessage({ type: 'CACHE_ERROR', reason: 'applicationCache not supported' }, '*');
        return;
    }

    appCache.addEventListener('checking', function () {
        window.parent.postMessage({ type: 'CACHE_CHECKING' }, '*');
    }, false);

    appCache.addEventListener('downloading', function () {
        window.parent.postMessage({ type: 'CACHE_DOWNLOADING' }, '*');
    }, false);

    appCache.addEventListener('progress', function (e) {
        var percent = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : -1;
        window.parent.postMessage({ type: 'CACHE_PROGRESS', percent: percent, loaded: e.loaded, total: e.total }, '*');
    }, false);

    appCache.addEventListener('cached', function () {
        window.parent.postMessage({ type: 'CACHE_COMPLETE' }, '*');
    }, false);

    appCache.addEventListener('noupdate', function () {
        window.parent.postMessage({ type: 'CACHE_EXISTS' }, '*');
    }, false);

    appCache.addEventListener('updateready', function () {
        try { appCache.swapCache(); } catch (e) {}
        window.parent.postMessage({ type: 'CACHE_COMPLETE' }, '*');
    }, false);

    appCache.addEventListener('error', function () {
        // Log the manifest URL and current appCache status to help diagnose
        var status = appCache.status;
        var statusNames = ['UNCACHED', 'IDLE', 'CHECKING', 'DOWNLOADING', 'UPDATEREADY', 'OBSOLETE'];
        var statusName = statusNames[status] || ('status=' + status);
        window.parent.postMessage({
            type: 'CACHE_ERROR',
            reason: 'AppCache error event fired. Status was: ' + statusName
        }, '*');
    }, false);

    // If the cache is already idle/ready, 'noupdate' may have fired before
    // these listeners were attached. Report current status so the parent
    // does not wait forever.
    if (appCache.status === appCache.IDLE || appCache.status === appCache.UPDATEREADY) {
        if (appCache.status === appCache.UPDATEREADY) {
            try { appCache.swapCache(); } catch (e) {}
        }
        window.parent.postMessage({ type: 'CACHE_EXISTS' }, '*');
    }
})();
