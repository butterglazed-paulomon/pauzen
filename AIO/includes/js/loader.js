/* WebKitty / PSFree Automated Loader
 * Steps:
 * 1. Detect firmware from client signals (navigator.userAgent)
 * 2. Select appropriate exploit chain and payload
 * 3. Verify / trigger offline caching
 * 4. Auto-run and auto-retry on failure with Stage Watchdog
 */

(function () {
    'use strict';

    // Global UI elements
    var consoleEl = document.getElementById('console');
    var platformBadge = document.getElementById('platform-badge');
    var fwBadge = document.getElementById('fw-badge');
    var fwContainer = document.getElementById('fw-container');
    var exploitBadge = document.getElementById('exploit-badge');
    var payloadBadge = document.getElementById('payload-badge');
    var attemptBadge = document.getElementById('attempt-badge');
    var statusBadge = document.getElementById('status-badge');
    var tipBox = document.getElementById('ps4-tip-box');

    // Watchdog configuration
    var stageWatchdogTimer = null;
    var totalWatchdogTimer = null;
    var STAGE_TIMEOUT_MS = 18000;   // 18s without stage/log activity triggers stall detection
    var TOTAL_TIMEOUT_MS = 60000;   // 60s total ceiling for exploit execution
    var exploitSucceeded = false;
    var reloading = false;

    // Helper to update status badge
    function setStatus(text, type) {
        if (!statusBadge) return;
        statusBadge.textContent = text;
        statusBadge.className = 'badge ' + (type || '');
    }

    // Helper to show PS4 browser reset tip
    function showBrowserTip(isSevere) {
        if (!tipBox) tipBox = document.getElementById('ps4-tip-box');
        if (tipBox) {
            tipBox.style.display = 'block';
            if (isSevere) {
                tipBox.className = 'tip-box alert-danger';
            }
        }
    }

    // Watchdog management
    function resetWatchdog() {
        if (exploitSucceeded || reloading) return;
        if (stageWatchdogTimer) clearTimeout(stageWatchdogTimer);
        stageWatchdogTimer = setTimeout(function () {
            if (exploitSucceeded || reloading) return;
            handleStalledExploit('Stage activity timeout (no progress for 18s)');
        }, STAGE_TIMEOUT_MS);
    }

    function stopWatchdog() {
        exploitSucceeded = true;
        if (stageWatchdogTimer) clearTimeout(stageWatchdogTimer);
        if (totalWatchdogTimer) clearTimeout(totalWatchdogTimer);
    }

    function startWatchdog() {
        exploitSucceeded = false;
        resetWatchdog();
        if (totalWatchdogTimer) clearTimeout(totalWatchdogTimer);
        totalWatchdogTimer = setTimeout(function () {
            if (exploitSucceeded || reloading) return;
            handleStalledExploit('Total exploit execution timeout (exceeded 60s)');
        }, TOTAL_TIMEOUT_MS);
    }

    function handleStalledExploit(reason) {
        if (reloading || exploitSucceeded) return;
        window.log('\n[!] WARNING: Exploit appears stalled at current stage.', '#ffbd2e');
        window.log('[!] ' + (reason || 'No stage progress detected.'), '#ffbd2e');
        window.log('[!] PS4 WebKit memory occasionally fragments and needs a clean reset.', '#ffbd2e');
        if (attempts >= 2) {
            window.log('[!] For highest success rate: Press PS button -> Close Browser Window -> Reopen User\'s Guide / Browser.', '#ff5f56');
            showBrowserTip(true);
        } else {
            showBrowserTip(false);
        }
        triggerAutoRetry(reason || 'Exploit stage stalled');
    }

    // Setup custom and global loggers
    window.log = function (message, color) {
        if (!consoleEl) consoleEl = document.getElementById('console');
        if (consoleEl) {
            var span = document.createElement('span');
            span.textContent = message + '\n';
            if (color) {
                span.style.color = color;
            } else {
                span.style.color = '#39ff14';
            }
            consoleEl.appendChild(span);
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }
        // Reset watchdog whenever new progress/log is emitted
        resetWatchdog();
    };
    window.print = window.log;

    // Attempt counter & Auto-retry logic
    var attempts = parseInt(sessionStorage.getItem('exploitAttempts') || '1', 10);
    if (localStorage.getItem('ExploitLoaded') === 'yes') {
        attempts = 1;
        sessionStorage.setItem('exploitAttempts', '1');
        localStorage.removeItem('ExploitLoaded');
    }
    if (attemptBadge) attemptBadge.textContent = '#' + attempts;

    // If already at attempt 3+, show browser tip proactively
    if (attempts >= 3) {
        showBrowserTip(true);
    }

    function triggerAutoRetry(err) {
        if (reloading || exploitSucceeded) return;
        reloading = true;
        stopWatchdog();
        setStatus('Stuck / Retrying', 'danger');

        var nextAttempt = attempts + 1;
        sessionStorage.setItem('exploitAttempts', nextAttempt.toString());

        window.log('\n[-] Exploit Issue: ' + (err || 'Unknown error / stall'), '#ff5f56');
        
        if (nextAttempt >= 3) {
            window.log('[!] Multiple attempts reached (' + nextAttempt + '). If stages keep stalling (e.g. 2/3), close browser window completely.', '#ffbd2e');
            showBrowserTip(true);
        }

        var countdown = 4;
        setStatus('Auto-retry in ' + countdown + 's', 'warning');
        window.log('[-] Auto-reloading in ' + countdown + ' seconds to retry...\n', '#ffbd2e');

        var countdownInterval = setInterval(function () {
            countdown--;
            if (countdown > 0) {
                setStatus('Auto-retry in ' + countdown + 's', 'warning');
            } else {
                clearInterval(countdownInterval);
                location.reload();
            }
        }, 1000);
    }
    window.triggerAutoRetry = triggerAutoRetry;

    window.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason;
        var msg = reason instanceof Error ? (reason.message + '\n' + reason.stack) : String(reason);
        triggerAutoRetry(msg);
    });

    window.addEventListener('error', function (event) {
        var msg = event.error ? (event.error.message + '\n' + event.error.stack) : (event.message || 'Script error');
        triggerAutoRetry(msg);
        return true;
    });

    window.jailbreakSuccess = function (statusMessage) {
        stopWatchdog();
        setStatus('Successful!', 'badge');
        window.log('\n========================================', '#39ff14');
        window.log('[+] ' + (statusMessage || 'Jailbreak successful! Payload loaded.'), '#39ff14');
        window.log('========================================\n', '#39ff14');
        sessionStorage.removeItem('exploitAttempts');
        sessionStorage.removeItem('jailbreakNow');
        localStorage.setItem('ExploitLoaded', 'yes');
    };

    window.retryExploit = function () {
        stopWatchdog();
        sessionStorage.setItem('exploitAttempts', '1');
        sessionStorage.removeItem('jailbreakNow');
        location.reload();
    };

    window.recacheApp = function () {
        stopWatchdog();
        try { localStorage.removeItem('aio_cache_ready'); } catch (e) {}
        try { sessionStorage.removeItem('aio_skip_cache'); } catch (e) {}
        try { sessionStorage.removeItem('aio_cache_failed'); } catch (e) {}
        location.href = 'cache.html';
    };

    // 1. Detect Firmware & Platform
    var ua = navigator.userAgent;
    var isPS4 = /PlayStation 4/i.test(ua);
    var fwVersion = "";

    if (isPS4) {
        var match = ua.match(/PlayStation 4[\/\s]+([\d.]+)/i);
        fwVersion = match ? match[1] : "9.00";
        if (platformBadge) platformBadge.textContent = "PlayStation 4";
        if (fwBadge) fwBadge.textContent = "PS4 " + fwVersion;
    } else {
        var detectedOS = "PC / Browser";
        if (/Android/i.test(ua)) detectedOS = "Android";
        else if (/iPhone|iPad|iPod/i.test(ua)) detectedOS = "iOS";
        else if (/Macintosh/i.test(ua)) detectedOS = "macOS";
        else if (/Windows/i.test(ua)) detectedOS = "Windows";
        else if (/Linux/i.test(ua)) detectedOS = "Linux";

        if (platformBadge) {
            platformBadge.textContent = detectedOS;
            platformBadge.className = "badge cyan";
        }

        // Allow changing test firmware on PC
        var savedTestFw = localStorage.getItem('test_fw') || '9.00';
        fwVersion = savedTestFw;

        if (fwContainer) {
            fwContainer.innerHTML = `
                <select id="fw-selector" class="select-input" onchange="onFwChange(this.value)">
                    <option value="6.72" ${fwVersion === '6.72' ? 'selected' : ''}>PS4 6.72</option>
                    <option value="7.55" ${fwVersion === '7.55' ? 'selected' : ''}>PS4 7.55</option>
                    <option value="9.00" ${fwVersion === '9.00' ? 'selected' : ''}>PS4 9.00</option>
                    <option value="11.00" ${fwVersion === '11.00' ? 'selected' : ''}>PS4 11.00</option>
                    <option value="12.50" ${fwVersion === '12.50' ? 'selected' : ''}>PS4 12.50</option>
                    <option value="13.00" ${fwVersion === '13.00' ? 'selected' : ''}>PS4 13.00</option>
                    <option value="13.52" ${fwVersion === '13.52' ? 'selected' : ''}>PS4 13.52</option>
                </select>
            `;
        }
    }

    window.onFwChange = function (val) {
        localStorage.setItem('test_fw', val);
        sessionStorage.setItem('exploitAttempts', '1');
        sessionStorage.removeItem('jailbreakNow');
        location.reload();
    };

    // 2. Select matching exploit method and payload
    var selectedChain = typeof getExploitForFw === 'function'
        ? getExploitForFw(fwVersion)
        : { id: 1, name: "PSFree Lapse (7.00 - 9.60)", runner: "psfreeLapse" };

    if (exploitBadge) exploitBadge.textContent = selectedChain.name;

    // Set default payload (GoldHEN v2.4b18.12)
    var defaultPayload = "./includes/payloads/GoldHEN/goldhen_v2.4b18.12.bin";
    sessionStorage.setItem('payload_path', defaultPayload);
    localStorage.setItem('currentJbFlavor', 'GoldHEN');
    localStorage.setItem('exploitChain', selectedChain.id);

    // Provide user global required by some scripts
    window.user = {
        platform: isPS4 ? "PS4" : "PC",
        ps4Fw: fwVersion,
        exploitChain: selectedChain.id,
        currentJbFlavor: "GoldHEN"
    };

    // 4. Auto-run the exploit
    async function startExploit() {
        startWatchdog();
        setStatus('Running Exploit...', 'warning');
        window.log('[*] PSFree PS4 Exploit Host');
        window.log('[*] Platform: ' + (isPS4 ? 'PlayStation 4' : 'PC Simulation Mode'));
        window.log('[*] Detected Firmware: ' + fwVersion);
        window.log('[*] Selected Exploit: ' + selectedChain.name);
        window.log('[*] Exploit Attempt: #' + attempts);
        window.log('[*] Target Payload: GoldHEN (goldhen_v2.4b18.12.bin)\n');

        try {
            switch (selectedChain.runner) {
                case 'badHoist':
                    await runBadHoist();
                    break;
                case 'psfreeLapse':
                    await runPsfreeLapse();
                    break;
                case 'cssFontFace':
                    await runCssFontFace();
                    break;
                case 'slopkitLapse':
                    await runSlopkitLapse();
                    break;
                case 'slopkitNetctrl':
                    await runSlopkitNetctrl();
                    break;
                case 'relapse':
                    await runRelapse();
                    break;
                default:
                    await runPsfreeLapse();
                    break;
            }
        } catch (e) {
            triggerAutoRetry(e);
        }
    }

    // Exploit Runners
    async function runBadHoist() {
        window.log('[+] Initializing Bad Hoist 6.7x exploit...');
        var jailbreakNow = sessionStorage.getItem('jailbreakNow') != null;
        if (!jailbreakNow) {
            sessionStorage.setItem('jailbreakNow', 'true');
            window.log('[+] Registering early entrypoint hook...');
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'src/badhoist/672entrypoint.js', false);
            xhr.send('');
            if (xhr.status === 200) {
                eval.call(top.window, xhr.responseText);
            }
        }
        await getScript('./src/badhoist/672kexploit.js');
        if (typeof KernelExploit672 === 'function') {
            var res = KernelExploit672();
            if (res === 0 || res === 91 || res === 179) {
                if (typeof getPayload672 === 'function') {
                    getPayload672(sessionStorage.getItem('payload_path'));
                }
                window.jailbreakSuccess();
            } else {
                throw new Error('Bad Hoist kernel return code: ' + res);
            }
        }
    }

    async function runPsfreeLapse() {
        window.log('[+] Loading PSFree Lapse bundle...');
        await getScript('./src/psfree-lapse/bundle.js');
        if (typeof doJailBreak === 'function') {
            window.log('[+] Executing doJailBreak()...');
            await doJailBreak();
            // If doJailBreak completed without calling jailbreakSuccess
            if (!localStorage.getItem('ExploitLoaded') && !exploitSucceeded) {
                throw new Error('PSFree execution ended without triggering payload.');
            }
        } else {
            throw new Error('doJailBreak function not found in bundle.js');
        }
    }

    async function runCssFontFace() {
        window.log('[+] Loading CSSFontFace exploit...');
        await getScript('./src/cssfontface/main.js');
        if (typeof doCssFontFaceJailbreak === 'function') {
            window.log('[+] Executing doCssFontFaceJailbreak()...');
            await doCssFontFaceJailbreak();
            if (!localStorage.getItem('ExploitLoaded') && !exploitSucceeded) {
                throw new Error('CSSFontFace execution ended without triggering payload.');
            }
    async function runSlopkitLapse() {
        window.log('[+] Loading SlopKit Lapse module...');
        await getScript('src/slopkit/chain_lapse.js', true);
    }

    async function runSlopkitNetctrl() {
        window.log('[+] Loading SlopKit Netctrl module...');
        await getScript('src/slopkit/chain_poops.js', true);
    }

    async function runRelapse() {
        window.log('[+] Loading Relapse module...');
        await getScript('src/relapse/jb.js', true);
    }

    // Auto-trigger on page ready after DOM is rendered
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(startExploit, 200);
        });
    } else {
        setTimeout(startExploit, 200);
    }

})();
