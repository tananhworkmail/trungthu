<?php
require_once __DIR__ . '/api/bootstrap.php';
$wishToken = $_SESSION['wish_token'];
session_write_close();
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="wish-token" content="<?= htmlspecialchars($wishToken, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Tết Trung Thu Tặng Mĩ Diên 🌕💛 Tấn Anh</title>
    
    <!-- Open Graph Meta Tags (Hiển thị preview tuyệt đẹp khi gửi qua Zalo / Facebook Messenger) -->
    <meta property="og:title" content="Tết Trung Thu Dành Riêng Cho Mĩ Diên 🌕💛">
    <meta property="og:description" content="Món quà Trung Thu ngọt ngào, lung linh và dễ thương nhất từ Tấn Anh gửi tặng Trần Thị Mỹ Duyên (Mĩ Diên).">
    <meta property="og:image" content="images/bg-moon.jpg">
    <meta property="og:type" content="website">
    
    <!-- Google Fonts Hiện Đại -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/galaxy.css">
    <link rel="stylesheet" href="css/cinema.css">
    <link rel="stylesheet" href="css/enchantment.css">
    <link rel="stylesheet" href="css/journey3d.css">
    <link rel="stylesheet" href="css/moonlit-details.css">
</head>
<body>

    <!-- Lớp Canvas Đồ Họa Đèn Trời & Pháo Hoa Ánh Sáng -->
    <canvas id="sky-canvas"></canvas>
    <canvas id="firework-canvas"></canvas>

    <!-- MÀN CHÀO MỞ ĐẦU: NỐI CHÒM SAO THÀNH TRÁI TIM -->
    <div id="opening-screen" class="opening-screen">
        <canvas id="galaxy-canvas" aria-hidden="true"></canvas>
        <div class="galaxy-vignette" aria-hidden="true"></div>
        <div class="galaxy-caption" aria-hidden="true"><b class="sender-name">Tấn Anh</b> <span>✦</span> <b class="recipient-name">Mĩ Diên</b></div>
        <div class="opening-card constellation-card">
            <div class="constellation-intro">
                <span class="eyebrow">MỘT BẦU TRỜI DÀNH RIÊNG CHO EM</span>
                <h1 id="welcome-title" class="welcome-title">Món Quà Trung Thu Gửi Mĩ Diên</h1>
                <p id="welcome-subtitle" class="welcome-subtitle">Một câu chuyện nhỏ, viết bằng ánh sao. Dành riêng cho Mĩ Diên.</p>
            </div>

            <div class="constellation-stage" id="constellation-stage" aria-label="Chòm sao trái tim">
                <div class="constellation-halo"></div>
                <div class="heart-orbit orbit-one" aria-hidden="true"></div><div class="heart-orbit orbit-two" aria-hidden="true"></div>
                <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
                <svg class="cupid-flight" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <defs><linearGradient id="arrow-trail"><stop stop-color="#f5faff" stop-opacity=".85"/><stop offset="1" stop-color="#a99cff" stop-opacity="0"/></linearGradient></defs>
                    <g id="cupid-arrow" opacity="0">
                        <path d="M5 0 H80" stroke="url(#arrow-trail)" stroke-width="1.4"/>
                        <path d="M7 0 H43 M36 0 L43 -4 M39 0 L46 -4 M36 0 L43 4 M39 0 L46 4" fill="none" stroke="#fff2cc" stroke-width=".6" stroke-linecap="round"/>
                        <path d="M0 0 L10 -4 L7 0 L10 4 Z" fill="#fff8e9" stroke="#fff" stroke-width=".25"/>
                    </g>
                </svg>
                <div class="heart-impact" aria-hidden="true"></div>
                <div class="constellation-heart" aria-hidden="true"><span>Vũ trụ của anh</span><strong>là em.</strong></div>
                <span class="constellation-star" style="--x:50%;--y:22%" data-star="1" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:38%;--y:12%" data-star="2" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:24%;--y:10%" data-star="3" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:13%;--y:18%" data-star="4" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:10%;--y:32%" data-star="5" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:16%;--y:46%" data-star="6" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:28%;--y:60%" data-star="7" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:50%;--y:82%" data-star="8" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:72%;--y:60%" data-star="9" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:84%;--y:46%" data-star="10" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:90%;--y:32%" data-star="11" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:87%;--y:18%" data-star="12" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:76%;--y:10%" data-star="13" aria-hidden="true"></span>
                <span class="constellation-star" style="--x:62%;--y:12%" data-star="14" aria-hidden="true"></span>
            </div>

            <p id="constellation-status" class="constellation-status" role="status" aria-live="polite">Có những vì sao, sinh ra là để tìm thấy nhau.</p>
            <button id="skip-opening-btn">Đến đêm trăng →</button>
        </div>
        <span class="galaxy-footnote" aria-hidden="true">MÙA TRĂNG ĐẦU TIÊN CỦA CHÚNG MÌNH · 2026</span>
    </div>

    <!-- GIAO DIỆN CHÍNH (MAIN CONTENT) -->
    <main id="main-content" class="main-content cinema hidden" aria-label="Mùa trăng của chúng mình">
        <canvas id="film-universe" aria-hidden="true"></canvas>
        <div class="cosmic-aurora aurora-one" aria-hidden="true"></div><div class="cosmic-aurora aurora-two" aria-hidden="true"></div>
        <header class="film-header"><span class="sender-name">Tấn Anh</span><i>✦</i><span class="recipient-name">Mĩ Diên</span></header>
        <p class="journey-touch-hint">Vuốt ngang hoặc dọc · Xoay 360° mọi hướng</p>
        <div class="film-stage">
            <section class="film-scene" data-title="Đi cùng em" aria-hidden="true" inert>
                <div class="scene-backdrop" style="background-image:url('images/chibi-trung-thu-ruoc-den.png')"></div>
                <div class="scene-camera">
                    <div class="scene-art"><img src="images/chibi-trung-thu-ruoc-den.png" alt="Hai đứa mình nắm tay nhau rước đèn ông sao" fetchpriority="high"></div>
                    <div class="scene-copy"><span class="scene-eyebrow">01 · PHỐ ĐÈN LỒNG</span><h2>Nắm tay em,<br>đi qua mùa trăng.</h2><p>Phố lên đèn. Còn trong lòng anh,<br>mọi ánh sáng đều mang tên em.</p></div>
                    <div class="foreground-lantern lantern-a" aria-hidden="true"></div><div class="foreground-lantern lantern-b" aria-hidden="true"></div>
                </div>
            </section>
            <section class="film-scene" data-title="Một chút ngọt ngào" aria-hidden="true" inert>
                <div class="scene-backdrop" style="background-image:url('images/chibi-trung-thu-banh-trang.png')"></div>
                <div class="scene-camera">
                    <div class="scene-art"><img src="images/chibi-trung-thu-banh-trang.png" alt="Mĩ Diên chia bánh Trung Thu với Tấn Anh dưới trăng"></div>
                    <div class="scene-copy"><span class="scene-eyebrow">02 · VỊ NGỌT ĐÊM RẰM</span><h2>Nửa chiếc bánh.<br>Cả một thương yêu.</h2><p>Có những điều bình dị,<br>ở bên em lại hóa thành hạnh phúc.</p></div>
                    <div class="foreground-lantern lantern-c" aria-hidden="true"></div>
                </div>
            </section>
            <section class="film-scene" data-title="Gửi lên trời một lời hẹn" aria-hidden="true" inert>
                <div class="scene-backdrop" style="background-image:url('images/chibi-trung-thu-uoc-nguyen.png')"></div>
                <div class="scene-camera">
                    <div class="scene-art"><img src="images/chibi-trung-thu-uoc-nguyen.png" alt="Hai đứa cùng nâng chiếc đèn ước nguyện bên hồ"></div>
                    <div class="scene-copy"><span class="scene-eyebrow">03 · ĐIỀU ƯỚC CỦA ANH</span><h2>Ngàn điều ước.<br>Chỉ một người.</h2><p>Mong em luôn bình an.<br>Mong mùa trăng nào cũng có chúng mình.</p></div>
                    <div class="foreground-lantern lantern-a" aria-hidden="true"></div><div class="foreground-lantern lantern-c" aria-hidden="true"></div>
                </div>
            </section>
            <section class="film-scene" data-title="Bình yên là bên em" aria-hidden="true" inert>
                <div class="scene-backdrop" style="background-image:url('images/chibi-trung-thu-ngam-trang.png')"></div>
                <div class="scene-camera">
                    <div class="scene-art"><img src="images/chibi-trung-thu-ngam-trang.png" alt="Mĩ Diên tựa vào vai Tấn Anh, cùng ngắm trăng rằm"></div>
                    <div class="scene-copy"><span class="scene-eyebrow">04 · DƯỚI CÙNG MỘT VẦNG TRĂNG</span><h2>Thế giới thật rộng.<br>Vai anh dành cho em.</h2><p>Chẳng cần đi đâu xa.<br>Chỉ cần em tựa vào, đêm đã dịu dàng.</p></div>
                    <div class="foreground-lantern lantern-b" aria-hidden="true"></div>
                </div>
            </section>
            <section class="film-scene film-finale" data-title="Còn những mùa trăng sau" aria-hidden="true" inert>
                <div class="scene-backdrop" style="background-image:url('images/chibi-trung-thu-ngam-trang.png')"></div>
                <div class="scene-camera">
                    <div class="scene-art"><img src="images/chibi-trung-thu-ngam-trang.png" alt="Mùa Trung Thu đầu tiên của hai đứa mình"></div>
                    <div class="scene-copy finale-copy">
                        <button id="close-finale-btn" class="return-to-space">← Trở về ngân hà</button>
                        <span class="scene-eyebrow">MÙA TRĂNG ĐẦU TIÊN · 2026</span>
                        <h2>Trung Thu này,<br>anh có em.</h2>
                        <p>Và anh mong, rất nhiều mùa trăng sau nữa.</p>
                        <div class="film-anniversary love-clock" role="group" aria-label="Thời gian chúng mình bên nhau">
                            <span class="love-clock-caption">Mỗi giây, thêm một chút thương</span>
                            <div class="love-clock-digits" role="timer" aria-live="off">
                                <span><strong id="counter-days">0</strong><small>ngày</small></span>
                                <span><strong id="counter-hours">00</strong><small>giờ</small></span>
                                <span><strong id="counter-minutes">00</strong><small>phút</small></span>
                                <span><strong id="counter-seconds">00</strong><small>giây</small></span>
                            </div>
                        </div>
                        <div class="finale-actions">
                            <button id="open-letter-btn" class="film-letter-btn celestial-button"><span class="button-symbol" aria-hidden="true">♡</span><span class="button-copy"><strong>Mở lá thư tình</strong><small>Một chút thương, gửi riêng em</small></span><span class="button-arrow" aria-hidden="true">↗</span></button>
                            <button id="film-replay" class="film-text-btn celestial-button"><span class="button-symbol" aria-hidden="true">↺</span><span class="button-copy"><strong>Thêm một lần nữa</strong><small>Xem lại hành trình của chúng mình</small></span></button>
                        </div>
                        <div id="wish-section" class="film-wish">
                            <label for="wish-input">Còn em, em ước điều gì?</label>
                            <div class="film-wish-line"><input id="wish-input" type="text" placeholder="Viết điều ước của em…" maxlength="60"><button id="send-wish-btn" class="celestial-button" aria-label="Thả đèn mang điều ước"><svg class="wish-lantern-icon" viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3Q10 1 15 3L17 15Q10 19 3 15Z M3 15Q10 12 17 15 M8 14Q7 10 10 8Q13 11 12 14 M7 20H13 M10 20V23" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="wish-send-label">Thả đèn</span></button></div>
                            <p id="wish-feedback" class="wish-feedback" role="status"></p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <canvas id="film-dust" aria-hidden="true"></canvas>
        <div class="film-grain" aria-hidden="true"></div>
        <nav class="film-controls" aria-label="Điều khiển vòng sao kỷ niệm">
            <button id="open-finale-btn" class="space-letter-link">Lời gửi em <span aria-hidden="true">✧</span></button>
            <div class="film-control-row"><span id="film-scene-label" role="status">01 / 05 · Đi cùng em</span><div class="film-playback"><button id="film-previous" aria-label="Xoay về kỷ niệm trước">↶</button><button id="film-pause" aria-label="Tạm dừng">Ⅱ</button><button id="film-next" aria-label="Xoay đến kỷ niệm tiếp theo">↷</button></div></div>
            <div class="film-timeline"><button class="film-chapter" aria-label="Cảnh 1: Rước đèn"><span></span></button><button class="film-chapter" aria-label="Cảnh 2: Chia bánh"><span></span></button><button class="film-chapter" aria-label="Cảnh 3: Ước nguyện"><span></span></button><button class="film-chapter" aria-label="Cảnh 4: Ngắm trăng"><span></span></button><button class="film-chapter" aria-label="Cảnh 5: Lời gửi em"><span></span></button></div>
        </nav>
    </main>

    <!-- MODAL BỨC THƯ TÌNH DƯỚI TRĂNG (SECRET LOVE LETTER) -->
    <div id="letter-modal" class="letter-modal" role="dialog" aria-modal="true" aria-labelledby="letter-title" inert>
        <div class="letter-envelope">
            <div class="letter-stardust" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span><span>♡</span><span>✧</span><span>✦</span></div>
            <button id="close-letter-btn" class="close-btn" title="Đóng thư" aria-label="Đóng thư">&times;</button>
            <div class="letter-scroll" tabindex="0" aria-label="Nội dung lá thư tình">
            <div class="letter-header">
                <span class="letter-overline">DƯỚI ÁNH TRĂNG · CHỈ RIÊNG EM</span>
                <div class="letter-photo-frame">
                    <img src="images/my-duyen.jpg" alt="Trần Thị Mỹ Duyên" class="letter-girl-photo">
                    <span class="photo-caption">Nàng thơ của anh · <span class="recipient-name">Mĩ Diên</span></span>
                </div>
                <div class="letter-seal-icon" aria-hidden="true">♡</div>
                <h3 id="letter-title" class="letter-title">Bức Thư Gửi Mĩ Diên Dễ Thương Của Tấn Anh</h3>
            </div>
            <div id="letter-body" class="letter-body">
                <!-- The complete letter appears with a gentle paragraph reveal. -->
            </div>
            <div class="letter-postscript" aria-hidden="true">✦ &nbsp; Một lá thư, thật nhiều thương &nbsp; ✦</div>
            </div>
        </div>
    </div>

    <!-- Scripts nạp theo thứ tự -->
    <script src="js/config.js"></script>
    <script src="js/sky-lanterns.js"></script>
    <script src="js/fireworks.js"></script>
    <script src="js/cosmic-sky.js"></script>
    <script src="js/galaxy.js"></script>
    <script src="js/cinema.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
