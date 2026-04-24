// ===== YT Batch Downloader - Main App Logic =====

(function () {
    'use strict';

    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const urlList = document.getElementById('urlList');
    const channelCount = document.getElementById('channelCount');
    const previewCode = document.getElementById('previewCode');
    const qualityGroup = document.getElementById('qualityGroup');

    const btnClear = document.getElementById('btnClear');
    const btnPaste = document.getElementById('btnPaste');
    const btnLoadFile = document.getElementById('btnLoadFile');
    const btnCopyCmd = document.getElementById('btnCopyCmd');
    const btnSaveBat = document.getElementById('btnSaveBat');
    const btnGenerate = document.getElementById('btnGenerate');
    const fileInput = document.getElementById('fileInput');
    const toast = document.getElementById('toast');
    const themeToggle = document.getElementById('themeToggle');

    // Settings elements
    const toolsFolder = document.getElementById('toolsFolder');
    const btnBrowseTools = document.getElementById('btnBrowseTools');
    const optAutoInstall = document.getElementById('optAutoInstall');
    const outputFolder = document.getElementById('outputFolder');
    const btnBrowseOutput = document.getElementById('btnBrowseOutput');
    const filenameTemplate = document.getElementById('filenameTemplate');
    const retries = document.getElementById('retries');
    const fragmentRetries = document.getElementById('fragmentRetries');
    const sleepInterval = document.getElementById('sleepInterval');
    const maxVideos = document.getElementById('maxVideos');
    const dateAfter = document.getElementById('dateAfter');
    const optSubtitle = document.getElementById('optSubtitle');
    const optThumbnail = document.getElementById('optThumbnail');
    const optMetadata = document.getElementById('optMetadata');
    const optArchive = document.getElementById('optArchive');
    const optPlaylistReverse = document.getElementById('optPlaylistReverse');

    // ===== URL Parsing =====
    function parseUrls(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line && line.startsWith('http'));
    }

    function getUrlType(url) {
        if (url.includes('playlist?list=') || url.includes('/playlists')) return 'playlist';
        if (url.includes('/watch?v=') || url.includes('youtu.be/')) return 'video';
        return 'channel';
    }

    function getUrlTypeLabel(type) {
        const labels = { channel: 'Kênh', playlist: 'Playlist', video: 'Video' };
        return labels[type] || 'URL';
    }

    // ===== Update URL List Preview =====
    function updateUrlList() {
        const urls = parseUrls(urlInput.value);
        urlList.innerHTML = '';

        urls.forEach((url, i) => {
            const type = getUrlType(url);
            const item = document.createElement('div');
            item.className = 'url-item';
            item.style.animationDelay = `${i * 0.05}s`;
            item.innerHTML = `
                <span class="url-index">${i + 1}</span>
                <span class="url-text" title="${url}">${url}</span>
                <span class="url-type ${type}">${getUrlTypeLabel(type)}</span>
                <button class="btn-remove" data-index="${i}" title="Xóa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            urlList.appendChild(item);
        });

        // Update count
        const count = urls.length;
        channelCount.textContent = `${count} ${count === 1 ? 'URL' : 'URLs'}`;

        // Update command preview
        updateCommandPreview();
    }

    // ===== Get tools path =====
    function getToolsPath() {
        return toolsFolder.value.replace(/\/$/g, '').replace(/\\$/g, '');
    }

    // ===== Build yt-dlp Command =====
    function buildCommand(url) {
        const tp = getToolsPath().replace(/\\/g, '\\\\');
        const parts = [`"${tp}\\\\yt-dlp.exe"`];

        // Quality
        const quality = document.querySelector('input[name="quality"]:checked').value;
        switch (quality) {
            case 'best':
                parts.push('-f', '"bestvideo+bestaudio/best"');
                break;
            case '1080':
                parts.push('-f', '"bestvideo[height<=1080]+bestaudio/best[height<=1080]"');
                break;
            case '720':
                parts.push('-f', '"bestvideo[height<=720]+bestaudio/best[height<=720]"');
                break;
            case 'audio':
                parts.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
                break;
        }

        // Retries & sleep
        parts.push('--retries', retries.value);
        parts.push('--fragment-retries', fragmentRetries.value);
        parts.push('--sleep-interval', sleepInterval.value);

        // Output
        const outPath = outputFolder.value.replace(/\\/g, '/');
        const template = filenameTemplate.value;
        parts.push('-o', `"${outPath}/${template}"`);

        // Options
        if (optSubtitle.checked) {
            parts.push('--write-subs', '--sub-langs', 'all');
        }
        if (optThumbnail.checked) {
            parts.push('--embed-thumbnail');
        }
        if (optMetadata.checked) {
            parts.push('--embed-metadata');
        }
        if (optArchive.checked) {
            parts.push('--download-archive', `"${outPath}/archive.txt"`);
        }
        if (optPlaylistReverse.checked) {
            parts.push('--playlist-reverse');
        }

        // Limits
        if (maxVideos.value) {
            parts.push('--max-downloads', maxVideos.value);
        }
        if (dateAfter.value) {
            parts.push('--dateafter', dateAfter.value);
        }

        // ffmpeg location
        parts.push('--ffmpeg-location', `"${tp}"`);

        // URL
        parts.push(`"${url}"`);

        return parts.join(' ');
    }

    function buildAllCommands() {
        const urls = parseUrls(urlInput.value);
        return urls.map(url => buildCommand(url));
    }

    function updateCommandPreview() {
        const urls = parseUrls(urlInput.value);
        if (urls.length === 0) {
            previewCode.textContent = 'Nhập URL để xem lệnh...';
            return;
        }
        previewCode.textContent = buildCommand(urls[0]);
    }

    // ===== Generate BAT File Content =====
    function generateBatContent() {
        const commands = buildAllCommands();
        if (commands.length === 0) return null;

        const tp = getToolsPath();

        const lines = [
            '@echo off',
            'chcp 65001 >nul',
            'title YT Batch Downloader',
            'color 0A',
            'echo.',
            'echo ╔══════════════════════════════════════════════════════════╗',
            'echo ║          YT BATCH DOWNLOADER - Tải Video Hàng Loạt     ║',
            'echo ╚══════════════════════════════════════════════════════════╝',
            'echo.',
            `echo   Tổng số: ${commands.length} URL(s)`,
            `echo   Thư mục lưu: ${outputFolder.value}`,
            `echo   Thư mục công cụ: ${tp}`,
            'echo.',
            'echo ──────────────────────────────────────────────────────────',
            '',
        ];

        // Auto-install tools if enabled
        if (optAutoInstall.checked) {
            lines.push(':: ===== Kiểm tra và tự động tải công cụ =====');
            lines.push(`if not exist "${tp}" mkdir "${tp}"`);
            lines.push('');
            lines.push(`if not exist "${tp}\\yt-dlp.exe" (`);
            lines.push('    echo [!] yt-dlp.exe chưa có. Đang tải...');
            lines.push(`    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -OutFile '${tp}\\yt-dlp.exe'"`);
            lines.push(`    if exist "${tp}\\yt-dlp.exe" (`);
            lines.push('        echo [OK] Đã tải yt-dlp.exe thành công!');
            lines.push('    ) else (');
            lines.push('        echo [LỖI] Không thể tải yt-dlp.exe. Vui lòng tải thủ công.');
            lines.push('        echo Tải tại: https://github.com/yt-dlp/yt-dlp/releases');
            lines.push('        pause');
            lines.push('        exit /b 1');
            lines.push('    )');
            lines.push(')');
            lines.push('');
            lines.push(`if not exist "${tp}\\ffmpeg.exe" (`);
            lines.push('    echo [!] ffmpeg.exe chưa có. Đang tải...');
            lines.push(`    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $zip='${tp}\\ffmpeg.zip'; Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile $zip; Expand-Archive -Path $zip -DestinationPath '${tp}\\ffmpeg-temp' -Force; Get-ChildItem -Path '${tp}\\ffmpeg-temp' -Recurse -Filter 'ffmpeg.exe' | ForEach-Object { Copy-Item $_.FullName '${tp}\\ffmpeg.exe' }; Get-ChildItem -Path '${tp}\\ffmpeg-temp' -Recurse -Filter 'ffprobe.exe' | ForEach-Object { Copy-Item $_.FullName '${tp}\\ffprobe.exe' }; Remove-Item $zip -Force; Remove-Item '${tp}\\ffmpeg-temp' -Recurse -Force"`);
            lines.push(`    if exist "${tp}\\ffmpeg.exe" (`);
            lines.push('        echo [OK] Đã tải ffmpeg.exe thành công!');
            lines.push('    ) else (');
            lines.push('        echo [LỖI] Không thể tải ffmpeg. Vui lòng tải thủ công.');
            lines.push('        echo Tải tại: https://www.gyan.dev/ffmpeg/builds/');
            lines.push('        pause');
            lines.push('        exit /b 1');
            lines.push('    )');
            lines.push(')');
            lines.push('');
            lines.push('echo [OK] Công cụ sẵn sàng!');
            lines.push('echo ──────────────────────────────────────────────────────────');
            lines.push('');
        }

        // Create output directory
        lines.push(`if not exist "${outputFolder.value}" mkdir "${outputFolder.value}"`);
        lines.push('');

        commands.forEach((cmd, i) => {
            const urls = parseUrls(urlInput.value);
            lines.push(`echo.`);
            lines.push(`echo [${i + 1}/${commands.length}] Đang tải: ${urls[i]}`);
            lines.push(`echo ──────────────────────────────────────────────────────────`);
            lines.push(cmd);
            lines.push(`if %errorlevel% equ 0 (`);
            lines.push(`    echo [OK] Hoàn thành: ${urls[i]}`);
            lines.push(`) else (`);
            lines.push(`    echo [LỖI] Thất bại: ${urls[i]}`);
            lines.push(`)`);
            lines.push('');
        });

        lines.push('echo.');
        lines.push('echo ══════════════════════════════════════════════════════════');
        lines.push('echo   HOÀN TẤT TẤT CẢ!');
        lines.push('echo ══════════════════════════════════════════════════════════');
        lines.push('echo.');
        lines.push('pause');

        return lines.join('\r\n');
    }

    // ===== Toast =====
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ===== Download BAT file =====
    function downloadBatFile(content, filename) {
        const blob = new Blob([content], { type: 'application/bat' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ===== Event Listeners =====

    // URL input change
    let debounceTimer;
    urlInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateUrlList, 300);
    });

    // Remove URL from list
    urlList.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove');
        if (!btn) return;
        const index = parseInt(btn.dataset.index);
        const lines = urlInput.value.split('\n');
        const urls = [];
        let urlIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed && trimmed.startsWith('http')) {
                if (urlIndex === index) {
                    lines[i] = '';
                }
                urlIndex++;
            }
        }
        urlInput.value = lines.filter(l => l.trim()).join('\n');
        updateUrlList();
    });

    // Clear
    btnClear.addEventListener('click', () => {
        urlInput.value = '';
        updateUrlList();
        showToast('Đã xóa tất cả URL');
    });

    // Paste
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (urlInput.value.trim()) {
                urlInput.value += '\n' + text;
            } else {
                urlInput.value = text;
            }
            updateUrlList();
            showToast('Đã dán từ clipboard');
        } catch (err) {
            showToast('Không thể đọc clipboard');
        }
    });

    // Load file
    btnLoadFile.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            urlInput.value = ev.target.result;
            updateUrlList();
            showToast(`Đã tải ${file.name}`);
        };
        reader.readAsText(file);
        fileInput.value = '';
    });

    // Quality radio cards
    qualityGroup.addEventListener('click', (e) => {
        const card = e.target.closest('.radio-card');
        if (!card) return;
        qualityGroup.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        card.querySelector('input').checked = true;
        updateCommandPreview();
    });

    // Copy command
    btnCopyCmd.addEventListener('click', () => {
        const commands = buildAllCommands();
        if (commands.length === 0) {
            showToast('Chưa có URL nào!');
            return;
        }
        navigator.clipboard.writeText(commands.join('\n')).then(() => {
            showToast('Đã sao chép lệnh!');
        });
    });

    // Save BAT
    btnSaveBat.addEventListener('click', () => {
        const content = generateBatContent();
        if (!content) {
            showToast('Chưa có URL nào!');
            return;
        }
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadBatFile(content, `yt-download-${timestamp}.bat`);
        showToast('Đã tạo file .BAT! Chạy file để bắt đầu tải.');
    });

    // Generate & Run (download BAT and show instructions)
    btnGenerate.addEventListener('click', () => {
        const content = generateBatContent();
        if (!content) {
            showToast('Chưa có URL nào!');
            return;
        }
        downloadBatFile(content, 'yt-download-now.bat');
        showToast('File .BAT đã tạo! Double-click để chạy.');
    });

    // ===== Browse Folder =====
    async function handleBrowseFolder(targetInput) {
        try {
            if (window.showDirectoryPicker) {
                const dirHandle = await window.showDirectoryPicker();
                targetInput.value = dirHandle.name;
                targetInput.dispatchEvent(new Event('input'));
                showToast(`Đã chọn: ${dirHandle.name} (Web chỉ lấy được tên thư mục)`);
            } else {
                showToast('Trình duyệt của bạn không hỗ trợ chọn thư mục.');
            }
        } catch (err) {
            // User cancelled
        }
    }

    if (btnBrowseTools) {
        btnBrowseTools.addEventListener('click', () => handleBrowseFolder(toolsFolder));
    }
    if (btnBrowseOutput) {
        btnBrowseOutput.addEventListener('click', () => handleBrowseFolder(outputFolder));
    }

    // Settings change -> update preview
    [toolsFolder, outputFolder, filenameTemplate, retries, fragmentRetries, sleepInterval,
        maxVideos, dateAfter, optSubtitle, optThumbnail, optMetadata,
        optArchive, optPlaylistReverse, optAutoInstall].forEach(el => {
            el.addEventListener('change', updateCommandPreview);
            if (el.type === 'text' || el.type === 'number') {
                el.addEventListener('input', updateCommandPreview);
            }
        });

    // ===== Load saved settings from localStorage =====
    function saveSettings() {
        const settings = {
            toolsFolder: toolsFolder.value,
            optAutoInstall: optAutoInstall.checked,
            outputFolder: outputFolder.value,
            filenameTemplate: filenameTemplate.value,
            retries: retries.value,
            fragmentRetries: fragmentRetries.value,
            sleepInterval: sleepInterval.value,
            quality: document.querySelector('input[name="quality"]:checked').value,
            optSubtitle: optSubtitle.checked,
            optThumbnail: optThumbnail.checked,
            optMetadata: optMetadata.checked,
            optArchive: optArchive.checked,
            optPlaylistReverse: optPlaylistReverse.checked,
            urls: urlInput.value,
        };
        localStorage.setItem('ytbd-settings', JSON.stringify(settings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('ytbd-settings');
        if (!saved) return;
        try {
            const s = JSON.parse(saved);
            if (s.toolsFolder) toolsFolder.value = s.toolsFolder;
            if (s.optAutoInstall !== undefined) optAutoInstall.checked = s.optAutoInstall;
            if (s.outputFolder) outputFolder.value = s.outputFolder;
            if (s.filenameTemplate) filenameTemplate.value = s.filenameTemplate;
            if (s.retries) retries.value = s.retries;
            if (s.fragmentRetries) fragmentRetries.value = s.fragmentRetries;
            if (s.sleepInterval) sleepInterval.value = s.sleepInterval;
            if (s.quality) {
                const radio = document.querySelector(`input[name="quality"][value="${s.quality}"]`);
                if (radio) {
                    radio.checked = true;
                    qualityGroup.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
                    radio.closest('.radio-card').classList.add('active');
                }
            }
            if (s.optSubtitle !== undefined) optSubtitle.checked = s.optSubtitle;
            if (s.optThumbnail !== undefined) optThumbnail.checked = s.optThumbnail;
            if (s.optMetadata !== undefined) optMetadata.checked = s.optMetadata;
            if (s.optArchive !== undefined) optArchive.checked = s.optArchive;
            if (s.optPlaylistReverse !== undefined) optPlaylistReverse.checked = s.optPlaylistReverse;
            if (s.urls) urlInput.value = s.urls;
            updateUrlList();
        } catch (e) {
            // ignore
        }
    }

    // Auto-save on changes
    const saveDebounce = () => {
        clearTimeout(saveDebounce._t);
        saveDebounce._t = setTimeout(saveSettings, 500);
    };

    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', saveDebounce);
        el.addEventListener('change', saveDebounce);
    });

    // Init
    loadSettings();
    updateUrlList();

    // ===== Theme Toggle =====
    function applyTheme(isLight) {
        if (isLight) {
            document.body.setAttribute('data-theme', 'light');
            themeToggle.checked = true;
        } else {
            document.body.removeAttribute('data-theme');
            themeToggle.checked = false;
        }
    }

    themeToggle.addEventListener('change', (e) => {
        const isLight = e.target.checked;
        applyTheme(isLight);
        localStorage.setItem('ytbd-theme', isLight ? 'light' : 'dark');
    });

    // Initialize theme from storage or system preference
    const savedTheme = localStorage.getItem('ytbd-theme');
    if (savedTheme === 'light') {
        applyTheme(true);
    } else if (savedTheme === 'dark') {
        applyTheme(false);
    } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight);
    }

})();
