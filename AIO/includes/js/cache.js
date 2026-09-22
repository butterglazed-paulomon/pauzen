// Handling cache
// Caching is now handled by cache.html + iframe_cache.js for firmware based caching
// This way we dont cache just everyhting for everyone. faster caching.

window.addEventListener('load', function () {
    // AppCache lives on the firmware iframe pages, not this document.
    // Status UNCACHED here is normal and must not trigger a redirect.
    if (isPS4 && !devMode && !localStorage.getItem('aio_cache_ready') && !sessionStorage.getItem('aio_skip_cache')) {
        sessionStorage.setItem('aio_skip_cache', '1');
        window.location.href = './cache.html';
    }
})

// Still not used anywhere because I'm not sure how useful this can be.
function terminateCache() {
    if (window.applicationCache) {
        // Status 3 is 'downloading', Status 1 is 'checking'
        if (window.applicationCache.status === 3 || window.applicationCache.status === 1) {
            console.log("Terminating cache process to save memory...");
            window.applicationCache.abort();
            document.title = projectName;
            window.applicationCache.removeEventListener("progress", null);
            window.applicationCache.oncached = null;
            window.applicationCache.onupdateready = null;
        }
    }
}