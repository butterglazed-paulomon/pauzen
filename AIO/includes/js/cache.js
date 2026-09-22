// Handling cache
// Unified caching is handled by cache.html and PSFree.manifest

window.addEventListener('load', function () {
    if (isPS4 && !devMode && !localStorage.getItem('aio_cache_ready') && !sessionStorage.getItem('aio_skip_cache')) {
        sessionStorage.setItem('aio_skip_cache', '1');
        window.location.href = './cache.html';
    }
});

function terminateCache() {
    if (window.applicationCache) {
        if (window.applicationCache.status === 3 || window.applicationCache.status === 1) {
            console.log("Terminating cache process...");
            window.applicationCache.abort();
        }
    }
}